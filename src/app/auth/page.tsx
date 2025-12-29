import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authProvider";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If not loading and user is authenticated, redirect to dashboard
    if (!isLoading && user) {
      navigate('/dashboard');
    } else if (!isLoading && !user) {
      // If not authenticated, redirect to login
      navigate('/auth/login');
    }
  }, [isLoading, user, navigate]);

  // Show loading while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
};

export default AuthPage;