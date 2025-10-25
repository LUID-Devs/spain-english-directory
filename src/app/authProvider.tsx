import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  sub: string;
  email: string;
  preferred_username?: string;
  [key: string]: string | number | boolean | undefined;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Debug timing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] AuthProvider mounted at:', Date.now());
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const authStart = Date.now();
    console.log('[AUTH] Starting auth check at:', authStart);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/status`, {
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const authEnd = Date.now();
      console.log('[AUTH] Auth request completed in:', authEnd - authStart, 'ms');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        console.log('[AUTH] User authenticated:', data.user?.username || 'Unknown');
      } else {
        setUser(null);
        console.log('[AUTH] User not authenticated');
      }
    } catch (error) {
      const authEnd = Date.now();
      console.error('[AUTH] Auth check failed after:', authEnd - authStart, 'ms', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AUTH] Auth loading complete at:', Date.now());
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = () => {
    router.push('/auth/login');
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state and redirect
      setUser(null);
      router.push('/auth/login');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page instead of showing login UI
    router.push('/auth/login');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;