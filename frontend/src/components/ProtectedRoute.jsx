import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Wait for session check (prevents premature redirect on page refresh)
  if (isLoading) {
    return <div className="p-6 text-slate-400">Loading session...</div>;
  }

  // 2. Redirect unauthenticated users to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Render child routes if authenticated
  return <Outlet />;
};