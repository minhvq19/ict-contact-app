// =====================================================================
// src/pages/StaffFormPage.jsx
// Component form để Thêm mới hoặc Chỉnh sửa thông tin cán bộ
// =====================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Hooks để lấy params URL và điều hướng
import { supabase } from '../services/supabaseClient'; // Supabase client
import { useAuth } from '../contexts/AuthContext'; // Hook để kiểm tra quyền (nếu cần)

function StaffFormPage() {
  const { staffId } = useParams(); // Lấy staffId từ URL (ví dụ: /staff/edit/abc-123)
  const navigate = useNavigate(); // Hook để điều hướng sau khi submit
  const isEditMode = Boolean(staffId); // Xác định chế độ: true nếu có staffId (sửa), false (thêm mới)
  const { isAdmin } = useAuth(); // Lấy quyền admin (có thể dùng để kiểm tra trước khi submit)

  // State lưu dữ liệu của form
  const [formData, setFormData] = useState({
    ho_ten: '',
    ngay_sinh: '',
    chi_nhanh: '',
    da_nghi_huu: false,
    so_dien_thoai: '',
    email: '',
    anh_dai_dien_url: '',
    vi_tri_cong_tac: '',
    ghi_chu: '',
  });
  const [avatarFile, setAvatarFile] = useState(null); // State lưu file ảnh mới chọn
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(''); // State lưu URL ảnh hiện tại khi sửa
  const [loading, setLoading] = useState(false); // State quản lý loading
  const [error, setError] = useState(null); // State quản lý lỗi

  // useEffect để fetch dữ liệu khi ở chế độ sửa
  useEffect(() => {
    if (isEditMode && staffId) {
      setLoading(true);
      const fetchStaffData = async () => {
        try {
          const { data, error: fetchError } = await supabase
            .from('can_bo')
            .select('*')
            .eq('id', staffId)
            .single();

          if (fetchError) throw fetchError;

          if (data) {
            setFormData({
              ...data,
              ngay_sinh: data.ngay_sinh || '',
              da_nghi_huu: data.da_nghi_huu || false,
            });
            setCurrentAvatarUrl(data.anh_dai_dien_url || '');
          } else {
            setError("Không tìm thấy thông tin cán bộ.");
          }
        } catch (err) {
          console.error("Lỗi tải dữ liệu cán bộ:", err);
          setError("Không thể tải dữ liệu cán bộ để chỉnh sửa.");
        } finally {
          setLoading(false);
        }
      };
      fetchStaffData();
    } else {
      // Reset form nếu là chế độ thêm mới hoặc không có staffId
      setFormData({
        ho_ten: '', ngay_sinh: '', chi_nhanh: '', da_nghi_huu: false,
        so_dien_thoai: '', email: '', anh_dai_dien_url: '',
        vi_tri_cong_tac: '', ghi_chu: '',
      });
      setCurrentAvatarUrl('');
      setAvatarFile(null);
      setError(null);
    }
  }, [staffId, isEditMode]); // Dependency array

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Xử lý chọn file ảnh
  const handleFileChange = (e) => {
    setAvatarFile(e.target.files ? e.target.files[0] : null);
  };

  // Hàm upload ảnh lên Storage
  const uploadAvatar = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `public/${fileName}`; // Lưu trong thư mục public của bucket

      setLoading(true);
      const { error: uploadError } = await supabase.storage
        .from('anh_dai_dien')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('anh_dai_dien').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      setError(`Upload ảnh thất bại: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa ảnh cũ khỏi Storage
  const deleteOldAvatar = async (avatarUrl) => {
    if (!avatarUrl) return;
    try {
      const filePathParts = avatarUrl.split('/anh_dai_dien/');
      if (filePathParts.length > 1) {
        const filePath = `public/${filePathParts[1]}`;
        await supabase.storage.from('anh_dai_dien').remove([filePath]);
      }
    } catch (err) {
      console.warn('Lỗi xóa ảnh cũ:', err.message);
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra quyền admin ở client (tăng cường UX)
    if (!isAdmin) {
        alert("Bạn không có quyền thực hiện thao tác này.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      let finalAvatarUrl = formData.anh_dai_dien_url; // Giữ URL cũ/hiện tại

      // Upload ảnh mới nếu có
      if (avatarFile) {
        if (isEditMode && currentAvatarUrl) {
          await deleteOldAvatar(currentAvatarUrl); // Xóa ảnh cũ trước
        }
        finalAvatarUrl = await uploadAvatar(avatarFile); // Upload ảnh mới
        if (!finalAvatarUrl && error) return; // Dừng nếu upload lỗi
      }

      // Chuẩn bị dữ liệu
      const dataToSubmit = { ...formData, anh_dai_dien_url: finalAvatarUrl };
      if (!isEditMode) {
        delete dataToSubmit.id;
        delete dataToSubmit.created_at;
      }

      // Thực hiện Insert hoặc Update
      let operationError = null;
      if (isEditMode) {
        const { error } = await supabase.from('can_bo').update(dataToSubmit).eq('id', staffId);
        operationError = error;
      } else {
        const { error } = await supabase.from('can_bo').insert([dataToSubmit]);
        operationError = error;
      }

      if (operationError) throw operationError; // Ném lỗi nếu có

      alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      navigate('/staff'); // Về trang danh sách

    } catch (err) {
      console.error('Lỗi submit form:', err);
      if (!error) setError(`Thao tác thất bại: ${err.message}`);
      alert(`Thao tác thất bại!`);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading khi fetch dữ liệu sửa
  if (loading && isEditMode && !formData.ho_ten) {
    return <div className="text-center p-10">Đang tải dữ liệu...</div>;
  }

  // Render Form
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-ict-blue text-center">
        {isEditMode ? 'Chỉnh sửa Thông tin Cán bộ' : 'Thêm mới Cán bộ'}
      </h1>
      {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Các trường input tương tự như phiên bản trước */}
        {/* Ví dụ Input Họ tên */}
        <div>
          <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
          <input
            type="text" id="ho_ten" name="ho_ten" value={formData.ho_ten}
            onChange={handleInputChange} required disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50"
          />
        </div>
        {/* ... Các input khác (Ngày sinh, Chi nhánh, SĐT, Email, Vị trí, Nghỉ hưu, Ảnh, Ghi chú) ... */}
         {/* Input Ngày sinh */}
         <div>
           <label htmlFor="ngay_sinh" className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
           <input type="date" id="ngay_sinh" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleInputChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50" />
         </div>
         {/* Input Chi nhánh */}
          <div>
           <label htmlFor="chi_nhanh" className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
           <input type="text" id="chi_nhanh" name="chi_nhanh" value={formData.chi_nhanh || ''} onChange={handleInputChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50" />
         </div>
          {/* Input Số điện thoại */}
          <div>
           <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
           <input type="tel" id="so_dien_thoai" name="so_dien_thoai" value={formData.so_dien_thoai || ''} onChange={handleInputChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50" />
         </div>
          {/* Input Email */}
          <div>
           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
           <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleInputChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50" />
         </div>
          {/* Input Vị trí công tác */}
          <div>
           <label htmlFor="vi_tri_cong_tac" className="block text-sm font-medium text-gray-700 mb-1">Vị trí công tác</label>
           <input type="text" id="vi_tri_cong_tac" name="vi_tri_cong_tac" value={formData.vi_tri_cong_tac || ''} onChange={handleInputChange} disabled={loading || formData.da_nghi_huu} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-100" />
         </div>
         {/* Checkbox Đã nghỉ hưu */}
         <div className="flex items-center pt-2">
           <input id="da_nghi_huu" name="da_nghi_huu" type="checkbox" checked={formData.da_nghi_huu} onChange={handleInputChange} disabled={loading} className="h-4 w-4 text-ict-blue focus:ring-ict-blue border-gray-300 rounded disabled:opacity-50" />
           <label htmlFor="da_nghi_huu" className="ml-2 block text-sm text-gray-900">Đã nghỉ hưu</label>
         </div>
          {/* Input Ảnh đại diện */}
          <div>
             <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
             {(currentAvatarUrl || avatarFile) && (
                 <img
                     src={avatarFile ? URL.createObjectURL(avatarFile) : currentAvatarUrl}
                     alt={avatarFile ? "Ảnh mới chọn" : "Ảnh đại diện hiện tại"}
                     className="w-24 h-24 rounded-md object-cover my-2 border border-gray-200"
                     onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}
                 />
             )}
             <input type="file" id="avatar" name="avatar" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" disabled={loading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ict-yellow file:text-ict-blue hover:file:bg-opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
             <p className="text-xs text-gray-500 mt-1">Chọn file ảnh (PNG, JPG, GIF).</p>
          </div>
          {/* Input Ghi chú */}
          <div>
           <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
           <textarea id="ghi_chu" name="ghi_chu" rows={3} value={formData.ghi_chu || ''} onChange={handleInputChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50" />
         </div>

        {/* Nút Submit và Hủy */}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={() => navigate('/staff')} disabled={loading} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">
            Hủy
          </button>
          <button type="submit" disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ict-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ict-blue disabled:opacity-50">
            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffFormPage;