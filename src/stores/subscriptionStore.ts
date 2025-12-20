import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { subscriptionApi, type SubscriptionData, type SubscriptionPlan } from '@/lib/subscription-api';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

// LuidHub API URL for subscription status
const LUIDHUB_API_URL = process.env.NEXT_PUBLIC_LUIDHUB_API_URL || 'https://api.luidhub.com/api';

interface LuidHubSubscription {
  planType: string;
  status: string;
  currentPeriodEnd?: string;
}

interface SubscriptionState {
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  error: string | null;

  // LuidHub subscription state
  luidHubSubscription: LuidHubSubscription | null;
  isPro: boolean;

  // Computed getters
  isSubscribed: boolean;
  isPremium: boolean;
  currentPlan: SubscriptionPlan | null;

  // Actions
  setSubscriptionData: (data: SubscriptionData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshSubscription: () => Promise<void>;
  canCreateTask: () => Promise<{ canCreate: boolean; reason?: string; upgradeRequired?: boolean }>;
  initializeSubscription: () => Promise<void>;
  fetchLuidHubSubscription: () => Promise<LuidHubSubscription | null>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    subscriptionData: null,
    loading: true,
    error: null,
    luidHubSubscription: null,
    isPro: false,
    
    // Computed getters
    get isSubscribed() {
      const data = get().subscriptionData;
      return data?.subscription?.name !== 'Free' && data?.subscription?.status === 'active';
    },
    
    get isPremium() {
      // Check LuidHub Pro status first
      const isPro = get().isPro;
      if (isPro) return true;

      const data = get().subscriptionData;
      const isSubscribed = get().isSubscribed;
      return isSubscribed &&
             (data?.subscription?.name === 'Pro' || data?.subscription?.name === 'Enterprise');
    },
    
    get currentPlan() {
      return get().subscriptionData?.subscription || null;
    },
    
    // Actions
    setSubscriptionData: (data) => 
      set({ subscriptionData: data, error: null }),
    
    setLoading: (loading) => 
      set({ loading }),
    
    setError: (error) => 
      set({ error, loading: false }),
    
    refreshSubscription: async () => {
      const { initializeSubscription } = get();
      await initializeSubscription();
    },
    
    canCreateTask: async () => {
      try {
        const result = await subscriptionApi.checkTaskCreation();
        return result;
      } catch (err) {
        console.error('Error checking task creation ability:', err);
        return { canCreate: true };
      }
    },
    
    initializeSubscription: async () => {
      const subStart = Date.now();
      console.log('[SUBSCRIPTION] Starting subscription fetch at:', subStart);
      
      try {
        set({ loading: true, error: null });
        
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
        set({ subscriptionData: data, loading: false });
      } catch (err) {
        const subEnd = Date.now();
        console.error('[SUBSCRIPTION] Subscription fetch failed after:', subEnd - subStart, 'ms', err);
        set({
          error: 'Failed to load subscription data',
          loading: false,
          subscriptionData: {
            subscription: SUBSCRIPTION_PLANS.FREE,
            usage: {
              tasksCreated: 0,
              taskLimit: 5,
              remaining: 5,
            },
            paymentMethods: [],
          }
        });
      }
    },

    // Fetch subscription status from LuidHub
    fetchLuidHubSubscription: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        set({ luidHubSubscription: null, isPro: false });
        return null;
      }

      try {
        const response = await fetch(`${LUIDHUB_API_URL}/subscription/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }

        const data = await response.json();
        const isPro = data.planType === 'pro' && data.status === 'active';

        set({
          luidHubSubscription: data,
          isPro,
        });

        return data;
      } catch (error) {
        console.error('Error fetching LuidHub subscription:', error);
        set({
          luidHubSubscription: null,
          isPro: false,
        });
        return null;
      }
    },
  }))
);

// Helper hooks for subscription data
export const useSubscription = () => {
  const {
    subscriptionData,
    loading,
    error,
    isSubscribed,
    isPremium,
    currentPlan,
    refreshSubscription,
    canCreateTask,
    isPro,
    luidHubSubscription,
    fetchLuidHubSubscription,
  } = useSubscriptionStore();

  return {
    subscriptionData,
    loading,
    error,
    isSubscribed,
    isPremium,
    currentPlan,
    refreshSubscription,
    canCreateTask,
    isPro,
    luidHubSubscription,
    fetchLuidHubSubscription,
  };
};

export const useSubscriptionData = () => useSubscriptionStore((state) => state.subscriptionData);
export const useSubscriptionLoading = () => useSubscriptionStore((state) => state.loading);
export const useSubscriptionError = () => useSubscriptionStore((state) => state.error);