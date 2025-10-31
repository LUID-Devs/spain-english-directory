import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { subscriptionApi, type SubscriptionData, type SubscriptionPlan } from '@/lib/subscription-api';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

interface SubscriptionState {
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  
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
}

export const useSubscriptionStore = create<SubscriptionState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    subscriptionData: null,
    loading: true,
    error: null,
    
    // Computed getters
    get isSubscribed() {
      const data = get().subscriptionData;
      return data?.subscription?.name !== 'Free' && data?.subscription?.status === 'active';
    },
    
    get isPremium() {
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
    canCreateTask 
  } = useSubscriptionStore();
  
  return {
    subscriptionData,
    loading,
    error,
    isSubscribed,
    isPremium,
    currentPlan,
    refreshSubscription,
    canCreateTask
  };
};

export const useSubscriptionData = () => useSubscriptionStore((state) => state.subscriptionData);
export const useSubscriptionLoading = () => useSubscriptionStore((state) => state.loading);
export const useSubscriptionError = () => useSubscriptionStore((state) => state.error);