import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/authProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth/login',
  showLoading = true 
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if not loading and user is not authenticated
    if (!isLoading && !user) {
      // Avoid redirect if already on an auth page
      if (!location.pathname.startsWith('/auth')) {
        navigate(redirectTo);
      }
    }
  }, [isLoading, user, navigate, redirectTo, location.pathname]);

  // Show loading state
  if (isLoading) {
    if (!showLoading) return null;
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on auth page, show nothing (redirect will happen)
  if (!user && !location.pathname.startsWith('/auth')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated or on auth page, render children
  return <>{children}</>;
};

export default ProtectedRoute;