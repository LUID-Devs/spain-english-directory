"use client";
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
      const userIdentifier = auth.user?.sub || auth.user?.userId || "";
      setUserIdentifier(userIdentifier);
      
      if (!userIdentifier) {
        setCurrentUser(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const user = await apiService.getAuthUser(userIdentifier);
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [auth.user, setUserIdentifier, setLoading, setError, setCurrentUser]);

  return <>{children}</>;
};