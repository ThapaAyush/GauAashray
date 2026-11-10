import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import GaushalasPage from './pages/GaushalasPage';
import RequestsPage from './pages/RequestsPage';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6ED] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80501D] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#7D6B58]">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route - Shows First */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="gaushalas" element={<GaushalasPage />} />
        <Route path="requests" element={<RequestsPage />} />
      </Route>

      {/* Fallback to root or login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

