// Import useState, useEffect từ React và supabase từ supabaseClient.
// Sử dụng useEffect để gọi API Supabase lấy danh sách cán bộ khi component được mount.
// Lưu danh sách vào state (staffList).
// Hiển thị dữ liệu ra bảng, xử lý trạng thái loading và error.
// Cập nhật code StaffListPage.jsx (chi tiết hơn, bao gồm nút Xóa và link Sửa/Xem):
// src/pages/StaffListPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth để kiểm tra quyền

function StaffListPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth(); // Lấy quyền admin từ context

  // Hàm fetch dữ liệu cán bộ
  async function fetchStaff() {
    setLoading(true);
    setError(null);
    try {
      // Gọi API Supabase để lấy dữ liệu từ bảng 'can_bo'
      const { data, error: fetchError } = await supabase
        .from('can_bo')
        .select('*') // Lấy tất cả các cột
        .order('ho_ten', { ascending: true }); // Sắp xếp theo họ tên A-Z

      if (fetchError) {
        // Nếu có lỗi từ Supabase, ném lỗi để catch xử lý
        throw fetchError;
      }
      // Cập nhật state với dữ liệu nhận được (hoặc mảng rỗng nếu data là null)
      setStaffList(data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách cán bộ:', err);
      setError('Không thể tải danh sách cán bộ. Vui lòng thử lại.');
    } finally {
      // Dù thành công hay lỗi, cũng dừng trạng thái loading
      setLoading(false);
    }
  }

  // Gọi hàm fetchStaff khi component được mount lần đầu
  useEffect(() => {
    fetchStaff();
  }, []); // Mảng dependency rỗng đảm bảo chỉ chạy 1 lần

  // --- HÀM XÓA CÁN BỘ ---
  const handleDelete = async (staffId, avatarUrl) => {
    // Kiểm tra quyền Admin ở client (chỉ để cải thiện UX, RLS là bảo mật chính)
    if (!isAdmin) {
      alert("Bạn không có quyền thực hiện hành động này.");
      return;
    }

    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (window.confirm('Bạn có chắc chắn muốn xóa cán bộ này? Hành động này không thể hoàn tác.')) {
      try {
        setLoading(true); // Bật loading

        // 1. (Tùy chọn) Xóa ảnh đại diện khỏi Supabase Storage nếu có
        if (avatarUrl) {
          // Tách tên file từ URL (giả sử URL có dạng .../public/anh_dai_dien/ten_file.jpg)
          const filePathParts = avatarUrl.split('/anh_dai_dien/');
          if (filePathParts.length > 1) {
            const filePath = `public/${filePathParts[1]}`; // Đường dẫn trong bucket
            const { error: storageError } = await supabase.storage
              .from('anh_dai_dien') // Tên bucket
              .remove([filePath]);
            if (storageError) {
              // Ghi log lỗi xóa ảnh nhưng không dừng hẳn quá trình xóa bản ghi
              console.warn('Lỗi xóa ảnh đại diện khỏi Storage:', storageError.message);
            }
          }
        }

        // 2. Xóa bản ghi cán bộ khỏi bảng 'can_bo' trong database
        const { error: deleteError } = await supabase
          .from('can_bo')
          .delete()
          .eq('id', staffId); // Chỉ xóa bản ghi có ID khớp

        if (deleteError) {
          // Nếu có lỗi xóa từ database, ném lỗi
          throw deleteError;
        }

        // 3. Cập nhật lại state `staffList` trên giao diện để loại bỏ cán bộ vừa xóa
        setStaffList(currentList => currentList.filter(staff => staff.id !== staffId));
        alert('Xóa cán bộ thành công!'); // Thông báo thành công

      } catch (err) {
        console.error('Lỗi xóa cán bộ:', err);
        setError('Xóa cán bộ thất bại: ' + err.message);
        alert('Xóa cán bộ thất bại!'); // Thông báo lỗi
      } finally {
        setLoading(false); // Tắt loading
      }
    }
  };
  // --- KẾT THÚC HÀM XÓA ---

  // --- Render UI ---
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold text-ict-blue">Danh sách Cán bộ</h1>
        {/* Chỉ hiển thị nút 'Thêm mới' nếu là admin */}
        {isAdmin && (
          <Link
            to="/staff/new"
            className="bg-ict-yellow text-ict-blue font-semibold px-4 py-2 rounded hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            + Thêm mới
          </Link>
        )}
      </div>

      {/* Hiển thị trạng thái Loading */}
      {loading && <p className="text-center text-gray-500 py-4">Đang tải danh sách...</p>}

      {/* Hiển thị thông báo lỗi */}
      {error && <p className="text-center text-red-500 py-4">{error}</p>}

      {/* Hiển thị bảng dữ liệu khi không loading và không có lỗi */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi nhánh</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">Không có dữ liệu cán bộ nào.</td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.ho_ten}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{staff.chi_nhanh || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{staff.so_dien_thoai || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{staff.email || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {staff.da_nghi_huu
                        ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã nghỉ hưu</span>
                        : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đang công tác</span>
                      }
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Link xem profile công khai (mở tab mới) */}
                      <Link
                        to={`/profile/${staff.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        title="Xem Profile Công khai"
                      >
                        Xem
                      </Link>
                      {/* Chỉ hiển thị nút Sửa, Xóa nếu là admin */}
                      {isAdmin && (
                        <>
                          {/* Link đến trang sửa */}
                          <Link
                            to={`/staff/edit/${staff.id}`}
                            className="text-yellow-600 hover:text-yellow-800 hover:underline"
                            title="Sửa thông tin"
                          >
                            Sửa
                          </Link>
                          {/* Nút xóa */}
                          <button
                            onClick={() => handleDelete(staff.id, staff.anh_dai_dien_url)}
                            className="text-red-600 hover:text-red-800 hover:underline"
                            disabled={loading} // Disable nút khi đang có thao tác khác diễn ra
                            title="Xóa cán bộ"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StaffListPage;