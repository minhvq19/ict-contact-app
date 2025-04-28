// =====================================================================
// src/pages/LoginPage.jsx
// Component trang đăng nhập
// =====================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook để điều hướng
import { useAuth } from '../contexts/AuthContext'; // Hook để lấy hàm login

function LoginPage() {
  const [email, setEmail] = useState(''); // State cho input email
  const [password, setPassword] = useState(''); // State cho input password
  const [loading, setLoading] = useState(false); // State quản lý trạng thái loading
  const [error, setError] = useState(''); // State quản lý thông báo lỗi
  const navigate = useNavigate(); // Hook điều hướng
  const { login } = useAuth(); // Lấy hàm login từ AuthContext

  // Hàm xử lý khi form được submit
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn form submit theo cách truyền thống
    setError(''); // Xóa lỗi cũ
    setLoading(true); // Bật trạng thái loading

    try {
      // Gọi hàm login từ AuthContext
      await login(email, password);
      // Nếu thành công, AuthContext sẽ cập nhật user và ProtectedRoute sẽ cho vào
      // Điều hướng về trang chủ
      navigate('/');
    } catch (err) {
      console.error("Login failed:", err);
      // Hiển thị thông báo lỗi thân thiện
      if (err.message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không đúng.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-ict-blue">Đăng nhập Hệ thống</h2>
        {/* Hiển thị lỗi nếu có */}
        {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50"
              disabled={loading} // Disable input khi đang loading
            />
          </div>
          {/* Input Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ict-blue focus:border-ict-blue sm:text-sm disabled:bg-gray-50"
              disabled={loading} // Disable input khi đang loading
            />
          </div>
          {/* Nút Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading} // Disable nút khi đang loading
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ict-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ict-blue disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;