import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MainLayout() {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-ict-blue text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl lg:text-2xl font-bold hover:opacity-80 transition-opacity">
            Quản lý Danh bạ ICT
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              to="/staff"
              className="px-3 py-1 rounded hover:bg-white hover:text-ict-blue transition-colors duration-200"
            >
              Danh sách
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="bg-ict-yellow text-ict-blue font-semibold px-3 py-1 rounded hover:opacity-90"
              >
                Đăng xuất
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-100 text-gray-600 text-center p-4 mt-auto text-sm">
        © {new Date().getFullYear()} - Phát triển bởi [minhvq19]
      </footer>
    </div>
  );
}
export default MainLayout;