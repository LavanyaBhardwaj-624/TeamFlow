import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/useAuthStore';
import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/config/routes';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    console.log("Protected Routes Loading : true")
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <Loader label="Restoring session..." size="lg" />
      </div>
    );
  }
  console.log("Protected Routes Loading : true " + `${isLoading} / ${location} / ${isAuthenticated}`)
  if (!isAuthenticated) {
      console.log("Protected Routes Loading : true " + `${isLoading} / ${location} / ${isAuthenticated}`)
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

