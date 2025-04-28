// Component này quản lý trạng thái đăng nhập và thông tin người dùng/quyền hạn toàn cục

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient'; // Import supabase client đã cấu hình
import { useNavigate } from 'react-router-dom'; // Hook để điều hướng trang

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Hook tùy chỉnh để sử dụng Context dễ dàng hơn
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Tạo Component Provider
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // State lưu thông tin user từ Supabase Auth
  const [userRole, setUserRole] = useState(null); // State lưu role ('admin' hoặc 'viewer')
  const [loadingInitial, setLoadingInitial] = useState(true); // State kiểm tra auth lần đầu
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm bất đồng bộ để lấy role từ bảng user_roles trong DB
  async function fetchUserRole(userId) {
    if (!userId) return null; // Không có user ID thì không cần fetch
    try {
      const { data, error } = await supabase
        .from('user_roles') // Tên bảng chứa role
        .select('role')     // Chỉ lấy cột role
        .eq('user_id', userId) // Điều kiện khớp user ID
        .single(); // Mong đợi chỉ một kết quả

      if (error) {
        // Nếu có lỗi (ví dụ user chưa được gán role), ghi log và trả về null
        console.error('Lỗi lấy user role:', error.message);
        return null;
      }
      return data?.role; // Trả về giá trị role ('admin', 'viewer') hoặc null
    } catch (err) {
      console.error('Exception khi lấy user role:', err);
      return null;
    }
  }

  // useEffect để kiểm tra và lắng nghe trạng thái đăng nhập khi Provider được mount
  useEffect(() => {
    setLoadingInitial(true); // Bắt đầu kiểm tra

    // Kiểm tra session hiện tại ngay lập tức
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser); // Cập nhật user state

        // Nếu có user, fetch role của họ
        if (currentUser) {
            const role = await fetchUserRole(currentUser.id);
            setUserRole(role);
        } else {
            setUserRole(null); // Nếu không có user, role là null
        }
        setLoadingInitial(false); // Đánh dấu đã kiểm tra xong lần đầu

        // Bắt đầu lắng nghe các thay đổi trạng thái auth sau này (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => { // _event là tên sự kiện (SIGNED_IN, SIGNED_OUT,...)
            const newCurrentUser = session?.user ?? null;
            setUser(newCurrentUser); // Cập nhật user state

            // Lấy lại role nếu có user mới, reset nếu không
            if (newCurrentUser) {
              const role = await fetchUserRole(newCurrentUser.id);
              setUserRole(role);
            } else {
              setUserRole(null);
            }
            // Không cần setLoadingInitial nữa
          }
        );

        // Hàm cleanup: Hủy lắng nghe khi component unmount để tránh leak memory
        return () => {
          authListener?.subscription.unsubscribe();
        };
    });

  }, []); // Mảng dependency rỗng đảm bảo useEffect chỉ chạy 1 lần

  // Hàm thực hiện đăng nhập bằng email/password
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error; // Ném lỗi nếu đăng nhập thất bại
    // onAuthStateChange sẽ tự động cập nhật user và role sau đó
  };

  // Hàm thực hiện đăng xuất
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error; // Ném lỗi nếu đăng xuất thất bại
    // Cập nhật state ngay và điều hướng về trang login
    setUser(null);
    setUserRole(null);
    navigate('/login');
  };

  // Giá trị được cung cấp bởi Context Provider cho các component con
  const value = {
    user,                   // Thông tin user (object hoặc null)
    userRole,               // Role ('admin', 'viewer', hoặc null)
    isAdmin: userRole === 'admin', // Biến tiện ích kiểm tra quyền admin
    login,                  // Hàm đăng nhập
    logout,                 // Hàm đăng xuất
    loadingInitial          // Trạng thái loading ban đầu
  };

  // Chỉ render các component con khi đã kiểm tra auth xong lần đầu
  return (
    <AuthContext.Provider value={value}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
}