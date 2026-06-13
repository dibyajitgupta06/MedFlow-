import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          {/* Professional custom medical spinner */}
          <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600 dark:border-slate-800"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading MedFlow Portal...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized, redirect to their role-specific dashboard home
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    return <Navigate to="/patient" replace />;
  }

  return children;
};

export default ProtectedRoute;
