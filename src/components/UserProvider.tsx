import React, { useEffect } from 'react';
import { useAuth } from '@/app/authProvider';
import { useUserStore } from '@/stores/userStore';
import { apiService } from '@/services/apiService';

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const auth = useAuth();
  const { setUserIdentifier, setLoading, setError, setCurrentUser } = useUserStore();
  
  useEffect(() => {
    const loadUser = async () => {
      // If auth is loading, don't do anything
      if (auth.isLoading) {
        return;
      }

      // If user is authenticated, set the user from auth
      if (auth.isAuthenticated && auth.user) {
        const userIdentifier = auth.user.sub || auth.user.email || String(auth.user.userId) || "";
        setUserIdentifier(userIdentifier);
        
        try {
          setLoading(true);
          setError(null);
          // For now, use the auth user directly or fetch additional user data
          if (auth.user.userId) {
            // If we already have a complete user object, use it
            setCurrentUser(auth.user as any);
          } else if (userIdentifier && typeof apiService.getAuthUser === 'function') {
            // Otherwise fetch the complete user data
            const user = await apiService.getAuthUser(String(userIdentifier));
            setCurrentUser(user);
          } else if (userIdentifier) {
            console.warn('apiService.getAuthUser is not available, using auth user');
            setCurrentUser(auth.user as any);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          setError(error instanceof Error ? error.message : 'Failed to load user');
        } finally {
          setLoading(false);
        }
      } else {
        // User is not authenticated
        setCurrentUser(null);
        setUserIdentifier("");
        setError(null);
      }
    };

    loadUser();
  }, [auth.user, auth.isAuthenticated, auth.isLoading, setUserIdentifier, setLoading, setError, setCurrentUser]);

  return <>{children}</>;
};