// Component này sẽ kiểm tra trạng thái loadingInitial và user từ AuthContext. Nếu chưa load xong hoặc chưa đăng nhập, nó sẽ chuyển hướng về trang /login. Nếu đã đăng nhập, nó sẽ render component con (<Outlet />).
// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
  const { user, loadingInitial } = useAuth(); // Lấy user và trạng thái loading ban đầu

  // Nếu đang trong quá trình kiểm tra auth lần đầu, hiển thị trạng thái chờ
  // Điều này quan trọng để tránh bị đá về trang login ngay lập tức khi refresh trang
  if (loadingInitial) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Đang kiểm tra xác thực...</div> {/* Hoặc một spinner đẹp hơn */}
      </div>
    );
  }

  // Nếu đã kiểm tra xong và không có user, chuyển hướng về trang login
  // `replace` để không lưu lại trang hiện tại vào history
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã kiểm tra xong và có user, render component con (trang được bảo vệ)
  return <Outlet />;
}

export default ProtectedRoute;