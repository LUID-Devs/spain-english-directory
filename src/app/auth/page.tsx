"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/status`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // If already authenticated, redirect to dashboard
          if (data.isAuthenticated) {
            router.push('/dashboard');
          } else {
            // If not authenticated, redirect to login page
            router.push('/auth/login');
          }
        } else {
          // If error checking auth status, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // If error, redirect to login
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Show loading while checking auth status
  if (!isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default AuthPage;