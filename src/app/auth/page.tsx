"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../authProvider";

const AuthPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If not loading and user is authenticated, redirect to dashboard
    if (!isLoading && user) {
      router.push('/dashboard');
    } else if (!isLoading && !user) {
      // If not authenticated, redirect to login
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  // Show loading while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};

export default AuthPage;