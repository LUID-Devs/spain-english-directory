'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionApi, type SubscriptionData, type SubscriptionPlan } from '@/lib/subscription-api';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

interface SubscriptionContextType {
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canCreateTask: () => Promise<{ canCreate: boolean; reason?: string; upgradeRequired?: boolean }>;
  isSubscribed: boolean;
  isPremium: boolean;
  currentPlan: SubscriptionPlan | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionApi.getCurrentSubscription();
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription data');
      // Set default free plan data
      setSubscriptionData({
        subscription: SUBSCRIPTION_PLANS.FREE,
        usage: {
          tasksCreated: 0,
          taskLimit: 5,
          remaining: 5,
        },
        paymentMethods: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const canCreateTask = async () => {
    try {
      const result = await subscriptionApi.checkTaskCreation();
      return result;
    } catch (err) {
      console.error('Error checking task creation ability:', err);
      return { canCreate: true };
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isSubscribed = subscriptionData?.subscription?.name !== 'Free' && 
                      subscriptionData?.subscription?.status === 'active';
  
  const isPremium = isSubscribed && 
                    (subscriptionData?.subscription?.name === 'Pro' || 
                     subscriptionData?.subscription?.name === 'Enterprise');

  const currentPlan = subscriptionData?.subscription || null;

  const value: SubscriptionContextType = {
    subscriptionData,
    loading,
    error,
    refreshSubscription,
    canCreateTask,
    isSubscribed,
    isPremium,
    currentPlan,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}