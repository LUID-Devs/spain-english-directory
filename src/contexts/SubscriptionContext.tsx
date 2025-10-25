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

  // Debug timing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SUBSCRIPTION] SubscriptionProvider mounted at:', Date.now());
    }
  }, []);

  const fetchSubscription = async () => {
    const subStart = Date.now();
    console.log('[SUBSCRIPTION] Starting subscription fetch at:', subStart);
    
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent blocking
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Subscription fetch timeout')), 5000)
      );
      
      const data = await Promise.race([
        subscriptionApi.getCurrentSubscription(),
        timeoutPromise
      ]) as SubscriptionData;
      
      const subEnd = Date.now();
      console.log('[SUBSCRIPTION] Subscription request completed in:', subEnd - subStart, 'ms');
      setSubscriptionData(data);
    } catch (err) {
      const subEnd = Date.now();
      console.error('[SUBSCRIPTION] Subscription fetch failed after:', subEnd - subStart, 'ms', err);
      setError('Failed to load subscription data');
      // Set default free plan data immediately
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
      console.log('[SUBSCRIPTION] Subscription loading complete at:', Date.now());
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