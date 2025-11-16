import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';

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
  refreshAuth: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      // First, try to get Cognito session (for OAuth users)
      let cognitoSession = null;
      let cognitoUser = null;

      try {
        console.log('[AUTH] Checking for Cognito session...');
        cognitoSession = await fetchAuthSession({ forceRefresh: false });

        if (cognitoSession?.tokens?.accessToken) {
          console.log('[AUTH] Cognito session found!');
          cognitoUser = await getCurrentUser();
          console.log('[AUTH] Cognito user:', cognitoUser.username);
        }
      } catch (cognitoError) {
        console.log('[AUTH] No Cognito session found');
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Build headers with Cognito tokens if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (cognitoSession?.tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${cognitoSession.tokens.accessToken}`;
      }

      // Also send ID token which contains email and other user attributes
      if (cognitoSession?.tokens?.idToken) {
        headers['X-ID-Token'] = `${cognitoSession.tokens.idToken}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/status`, {
        credentials: 'include', // Still send cookies for traditional auth
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);
      const authEnd = Date.now();
      console.log('[AUTH] Auth request completed in:', authEnd - authStart, 'ms');

      if (response.ok) {
        const data = await response.json();
        console.log('[AUTH] Backend response:', data);

        // If backend returns user data, use it
        if (data.user && data.isAuthenticated) {
          setUser(data.user);
          console.log('[AUTH] User authenticated from backend:', data.user.username || data.user.email || data.user.sub);
        } else if (cognitoUser) {
          // Fallback to Cognito user data if backend doesn't return user
          console.log('[AUTH] Using Cognito user data as fallback');
          setUser({
            sub: cognitoUser.userId,
            email: cognitoUser.username,
            username: cognitoUser.username,
            preferred_username: cognitoUser.username,
          });
        } else {
          setUser(null);
          console.log('[AUTH] No user data available');
        }
      } else if (cognitoUser) {
        // If backend request fails but we have Cognito session, use Cognito data
        console.log('[AUTH] Backend request failed, using Cognito user data');
        setUser({
          sub: cognitoUser.userId,
          email: cognitoUser.username,
          username: cognitoUser.username,
          preferred_username: cognitoUser.username,
        });
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

  // Remove global redirect - let individual pages handle their own auth requirements

  const login = () => {
    navigate('/auth/login');
  };

  const logout = async () => {
    try {
      // Sign out from Cognito if there's a Cognito session
      try {
        await signOut();
        console.log('[AUTH] Signed out from Cognito');
      } catch (cognitoError) {
        console.log('[AUTH] No Cognito session to sign out from');
      }

      // Also logout from backend (for traditional auth)
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear user state and redirect, regardless of API call result
      setUser(null);
      navigate('/auth/login');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth: checkAuthStatus
  };

  // Always render children - let individual pages handle auth requirements

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