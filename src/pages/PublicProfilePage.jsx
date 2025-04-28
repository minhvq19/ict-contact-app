// =====================================================================
// src/pages/PublicProfilePage.jsx
// Component hiển thị trang profile công khai (đã bỏ QR Code)
// =====================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Hook để lấy params URL và Link
import { supabase } from '../services/supabaseClient'; // Supabase client

function PublicProfilePage() {
  const { staffId } = useParams(); // Lấy staffId từ URL
  const [profile, setProfile] = useState(null); // State lưu thông tin profile
  const [loading, setLoading] = useState(true); // State quản lý loading
  const [error, setError] = useState(null); // State quản lý lỗi
  const [imgError, setImgError] = useState(false); // State xử lý lỗi tải ảnh

  // useEffect để fetch dữ liệu khi component mount hoặc staffId thay đổi
  useEffect(() => {
    async function fetchPublicProfile() {
      setLoading(true);
      setError(null);
      setImgError(false); // Reset lỗi ảnh
      try {
        // Chỉ select các cột cần hiển thị công khai
        const { data, error: fetchError } = await supabase
          .from('can_bo')
          .select('ho_ten, chi_nhanh, so_dien_thoai, anh_dai_dien_url')
          .eq('id', staffId) // Điều kiện khớp ID
          .single(); // Mong đợi 1 kết quả

        if (fetchError) {
          // Xử lý lỗi từ Supabase (ví dụ: không tìm thấy bản ghi)
          if (fetchError.code === 'PGRST116') { // Mã lỗi cho single() không tìm thấy
            throw new Error('Không tìm thấy hồ sơ cán bộ.');
          } else {
            throw fetchError; // Ném lỗi khác
          }
        }
        setProfile(data); // Cập nhật state profile
      } catch (err) {
        console.error('Lỗi lấy hồ sơ công khai:', err);
        setError(err.message || 'Không thể tải hồ sơ công khai.');
      } finally {
        setLoading(false); // Kết thúc loading
      }
    }
    fetchPublicProfile(); // Gọi hàm fetch
  }, [staffId]); // Dependency array

  // Hàm xử lý khi ảnh bị lỗi không tải được
  const handleImageError = () => {
    setImgError(true);
  };

  // --- Render UI ---
  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-ict-blue">Đang tải hồ sơ...</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <p className="text-lg text-red-600 mb-4">Lỗi: {error}</p>
        <Link to="/" className="text-ict-blue hover:underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Hiển thị nếu không tìm thấy profile (dù không có lỗi)
  if (!profile) {
     return (
       <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
         <p className="text-lg text-gray-600 mb-4">Không tìm thấy thông tin hồ sơ.</p>
         <Link to="/" className="text-ict-blue hover:underline">
           Quay lại trang chủ
         </Link>
       </div>
     );
  }

  // Render thông tin profile nếu thành công
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        {/* Phần header với ảnh đại diện */}
        <div className="bg-gradient-to-r from-ict-blue to-teal-600 h-24 flex items-center justify-center relative">
          {/* Hiển thị ảnh hoặc placeholder */}
          {!imgError && profile.anh_dai_dien_url ? (
            <img
              src={profile.anh_dai_dien_url}
              alt={`Ảnh đại diện ${profile.ho_ten}`}
              className="w-28 h-28 rounded-full object-cover border-4 border-white absolute -bottom-14 shadow-lg"
              onError={handleImageError} // Xử lý nếu ảnh lỗi
            />
          ) : (
            // Placeholder hình tròn với chữ cái đầu
            <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold border-4 border-white absolute -bottom-14 shadow-lg">
              {profile.ho_ten ? profile.ho_ten.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>

        {/* Phần thông tin chi tiết */}
        <div className="pt-16 pb-6 px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{profile.ho_ten}</h1>
          <p className="text-md text-gray-600 mb-4">{profile.chi_nhanh || 'Chưa cập nhật chi nhánh'}</p>

          {/* Thông tin liên hệ */}
          <div className="space-y-2 mb-6 text-left text-sm text-gray-700 px-4 border-t pt-4 mt-4">
             <p>
                <strong className="inline-block w-24 font-medium text-gray-500">Chi nhánh:</strong>
                <span>{profile.chi_nhanh || 'N/A'}</span>
             </p>
             <p>
                <strong className="inline-block w-24 font-medium text-gray-500">Điện thoại:</strong>
                <span>{profile.so_dien_thoai || 'N/A'}</span>
             </p>
             {/* Có thể thêm các thông tin công khai khác ở đây nếu muốn */}
          </div>

          {/* Đã loại bỏ phần QR Code */}

        </div>
         {/* (Tùy chọn) Nút quay lại */}
         {/* <div className="text-center pb-4 border-t pt-4">
            <Link to="/staff" className="text-sm text-ict-blue hover:underline">
                Quay lại danh sách
            </Link>
         </div> */}
      </div>
    </div>
  );
}

export default PublicProfilePage;