import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ allowedRoles }) {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // TODO: Replace with a proper loader
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user doesn't have the required role, redirect to their default dashboard or home
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'judge') return <Navigate to="/judge" replace />;
    if (role === 'participant') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;