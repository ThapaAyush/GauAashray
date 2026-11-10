import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, activeRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F3]">
        <Loader2 className="w-8 h-8 text-[#80501D] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine current active side (User can only be on one side at one time!)
  const effectiveRole = activeRole || user.activeRole || user.role;

  // Check roles against effective active side
  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    // If user has Gaushala linked but is currently on Public User side, prompt to switch mode in profile
    if (allowedRoles.includes('GAUSHALA_OWNER') && (user.gaushala || user.role === 'GAUSHALA_OWNER')) {
      return <Navigate to="/profile" state={{ promptSwitch: 'GAUSHALA_OWNER', from: location.pathname }} replace />;
    }

    if (effectiveRole === 'SUPER_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (effectiveRole === 'GAUSHALA_OWNER') {
      return <Navigate to="/gaushala/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // If Gaushala owner is accessing operational features but is not approved
  if (effectiveRole === 'GAUSHALA_OWNER' && location.pathname.startsWith('/gaushala')) {
    const isApproved = user.gaushala && (typeof user.gaushala === 'object' ? user.gaushala.status === 'APPROVED' : true);
    if (!isApproved) {
      return <Navigate to="/application-status" replace />;
    }
  }

  return children;
}

