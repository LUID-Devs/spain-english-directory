import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';

interface User {
  sub: string;
  email: string;
  preferred_username?: string;
  userId?: number;
  username?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  settings?: { isPersonal?: boolean };
  role?: string;
}

interface AuthError {
  message: string;
  type: 'network' | 'auth' | 'unknown';
  retryable: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  organizations: Organization[];
  activeOrganization: Organization | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  switchWorkspace: (organizationId: number) => Promise<void>;
  clearError: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const userRef = useRef<User | null>(null);
  const authCheckInFlightRef = useRef<Promise<void> | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Debug timing
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[AUTH] AuthProvider mounted at:', Date.now());
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (authCheckInFlightRef.current) {
      return authCheckInFlightRef.current;
    }

    const runAuthCheck = async (attempt = 1, maxAttempts = 3) => {
    const authStart = Date.now();
    console.log('[AUTH] Starting auth check at:', authStart, 'attempt:', attempt);
    
    // Clear any previous errors
    setError(null);

    // Declare Cognito variables in function scope so they're available in all catch blocks
    let cognitoSession: any = null;
    let cognitoUser: any = null;

    try {
      // First, try to get Cognito session (for OAuth users)
      try {
      
        cognitoSession = await fetchAuthSession({ forceRefresh: attempt > 1 });

        if (cognitoSession?.tokens?.accessToken) {
          console.log('[AUTH] Cognito session found!');
          cognitoUser = await getCurrentUser();
          console.log('[AUTH] Cognito user:', cognitoUser.username);
        }
      } catch (cognitoError) {
        console.log('[AUTH] No Cognito session found');
      }

      // Add timeout to prevent hanging (increased to 10s for slow backend responses)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
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

        const authEnd = Date.now();
        console.log('[AUTH] Auth request completed in:', authEnd - authStart, 'ms');

        if (response.ok) {
          const data = await response.json();
          console.log('[AUTH] Backend response:', data);

          // If backend returns user data, use it
          if (data.user && data.isAuthenticated) {
            setUser(data.user);
            console.log('[AUTH] User authenticated from backend:', data.user.username || data.user.email || data.user.sub);

            // Set organizations and active organization
            if (data.organizations) {
              setOrganizations(data.organizations);
              console.log('[AUTH] Organizations loaded:', data.organizations.length);
            }
            if (data.activeOrganization) {
              setActiveOrganization(data.activeOrganization);
              console.log('[AUTH] Active organization:', data.activeOrganization.name);
            }
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
            setOrganizations([]);
            setActiveOrganization(null);
            console.log('[AUTH] No user data available');
          }
        } else if (cognitoUser) {
          // If backend request fails but we have Cognito session, use Cognito data
          console.warn('[AUTH] Backend request failed with status:', response.status, '- using Cognito fallback user');
          setUser({
            sub: cognitoUser.userId,
            email: cognitoUser.username,
            username: cognitoUser.username,
            preferred_username: cognitoUser.username,
          });
        } else {
          // If we have Cognito user but backend doesn't know about them yet,
          // retry after a short delay (user might be in process of being created)
          if (cognitoUser && attempt < maxAttempts) {
            console.log(`[AUTH] Backend doesn't recognize user yet, retrying in ${attempt * 500}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
            return runAuthCheck(attempt + 1, maxAttempts);
          }
          
          setUser(null);
          setOrganizations([]);
          setActiveOrganization(null);
          console.log('[AUTH] User not authenticated');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      const authEnd = Date.now();
      console.error('[AUTH] Auth check failed after:', authEnd - authStart, 'ms', error);
      
      // If this is a network error and we have retries left, try again
      if (attempt < maxAttempts && cognitoUser) {
        const isNetworkError = error instanceof Error && 
          (error.name === 'AbortError' || error.message?.includes('fetch') || error.message?.includes('network'));
        
        if (isNetworkError) {
          console.log(`[AUTH] Network error, retrying in ${attempt * 800}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 800));
          return runAuthCheck(attempt + 1, maxAttempts);
        }
      }

      // Determine error type for user feedback
      let authError: AuthError;
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          authError = {
            message: 'Authentication request timed out. Please check your connection and try again.',
            type: 'network',
            retryable: true
          };
        } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
          authError = {
            message: 'Network error. Please check your internet connection.',
            type: 'network',
            retryable: true
          };
        } else {
          authError = {
            message: 'Authentication failed. Please try again.',
            type: 'unknown',
            retryable: true
          };
        }
      } else {
        authError = {
          message: 'An unexpected error occurred. Please try again.',
          type: 'unknown',
          retryable: true
        };
      }
      
      setError(authError);

      if (cognitoUser) {
        // Keep user authenticated client-side if backend status endpoint is temporarily slow
        console.warn('[AUTH] Preserving Cognito user after auth status failure');
        setUser({
          sub: cognitoUser.userId,
          email: cognitoUser.username,
          username: cognitoUser.username,
          preferred_username: cognitoUser.username,
        });
      } else if (!userRef.current) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      console.log('[AUTH] Auth loading complete at:', Date.now());
    }
    };

    const currentRun = runAuthCheck().finally(() => {
      authCheckInFlightRef.current = null;
    });

    authCheckInFlightRef.current = currentRun;
    return currentRun;
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
      setOrganizations([]);
      setActiveOrganization(null);
      navigate('/auth/login');
    }
  };

  const switchWorkspace = async (organizationId: number) => {
    try {
      console.log('[AUTH] Switching workspace to:', organizationId);

      // Get Cognito tokens for auth header
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      try {
        const session = await fetchAuthSession();
        if (session?.tokens?.accessToken) {
          headers['Authorization'] = `Bearer ${session.tokens.accessToken}`;
        }
        if (session?.tokens?.idToken) {
          headers['X-ID-Token'] = `${session.tokens.idToken}`;
        }
      } catch (e) {
        console.log('[AUTH] No Cognito session for workspace switch');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/organizations/switch`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.activeOrganization) {
          setActiveOrganization(data.data.activeOrganization);
          console.log('[AUTH] Workspace switched to:', data.data.activeOrganization.name);
        }
      } else {
        console.error('[AUTH] Failed to switch workspace');
      }
    } catch (error) {
      console.error('[AUTH] Workspace switch error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    organizations,
    activeOrganization,
    login,
    logout,
    refreshAuth: checkAuthStatus,
    switchWorkspace,
    clearError,
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
