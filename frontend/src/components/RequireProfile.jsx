import React from "react";
import { Navigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireProfile = () => {
  const { isProfileComplete, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#1e1e1e] flex items-center justify-center text-white">Loading...</div>;
  }

  // Redirect to onboarding if required metrics (like MHR) are missing
  if (!isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};