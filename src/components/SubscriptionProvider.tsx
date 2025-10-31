import React, { useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { initializeSubscription } = useSubscriptionStore();
  
  useEffect(() => {
    // Initialize subscription data when the provider mounts
    initializeSubscription();
  }, [initializeSubscription]);

  return <>{children}</>;
};