import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StaffListPage from './pages/StaffListPage';
import StaffFormPage from './pages/StaffFormPage';
import PublicProfilePage from './pages/PublicProfilePage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './contexts/AuthContext';
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/:staffId" element={<PublicProfilePage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/staff" element={<StaffListPage />} />
            <Route path="/staff/new" element={<StaffFormPage />} />
            <Route path="/staff/edit/:staffId" element={<StaffFormPage />} />
          </Route>
        </Route>

        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </AuthProvider>
  );
}
export default App;