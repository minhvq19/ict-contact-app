import React from 'react';
// import { useAuth } from '../contexts/AuthContext'; // Sẽ dùng sau

function HomePage() {
  // const { user } = useAuth(); // Sẽ dùng sau

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-bidv-blue">Trang chủ</h1>
      <p>Chào mừng bạn đến với hệ thống quản lý danh bạ cán bộ ICT.</p>
      {/* Nội dung trang chủ sẽ được thêm sau */}
    </div>
  );
}
export default HomePage;
