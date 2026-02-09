import React, { useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuth } from '@/app/authProvider';

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

/**
 * SubscriptionProvider
 *
 * Initializes subscription and credits data when the user is authenticated.
 * This provider should wrap your authenticated app content.
 *
 * Note: We use useAuth() instead of useCurrentUser() from userStore because
 * SubscriptionProvider is placed BEFORE UserProvider in the component tree
 * (in dashboard/layout.tsx), so userStore.currentUser would always be null here.
 */
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { fetchSubscription } = useSubscriptionStore();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't fetch while auth is loading
    if (isLoading) {
      return;
    }

    // Only fetch when user is authenticated
    if (isAuthenticated && user) {
      // Small delay to ensure Cognito tokens are fully available
      const timer = setTimeout(() => {
        fetchSubscription();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, isLoading, fetchSubscription]);

  return <>{children}</>;
};

export default SubscriptionProvider;
