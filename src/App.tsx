import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import { PublicServices } from './pages/PublicServices';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { UserDashboardLayout } from './pages/UserDashboard';
import { AdminDashboardLayout } from './pages/AdminDashboard';
import { GlobalAdminNotifications } from './components/GlobalAdminNotifications';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalAdminNotifications />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<PublicServices />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Standard User Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <UserDashboardLayout />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
