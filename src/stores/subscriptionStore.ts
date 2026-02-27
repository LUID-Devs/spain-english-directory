import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  creditsApi,
  type CreditBalance,
  type SubscriptionStatus,
} from '@/lib/credits-api';

/**
 * Get the authentication token from Cognito
 * Uses dynamic import to ensure Amplify is fully initialized
 * This matches the pattern used in apiService.ts which works correctly
 * @returns The access token or null if not authenticated
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Use dynamic import like apiService.ts does - this ensures Amplify is configured
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    return token || null;
  } catch (error) {
    return null;
  }
};

// Credits state interface
interface CreditsState {
  totalCredits: number;
  subscriptionCredits: number;
  purchasedCredits: number;
}

// Subscription state interface
interface SubscriptionState {
  planType: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionStoreState {
  // Credits state
  credits: CreditsState;

  // Subscription state
  subscription: SubscriptionState;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Computed properties
  isPro: boolean;
  isEnterprise: boolean;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Subscription API actions
  fetchSubscription: () => Promise<{
    subscription: SubscriptionStatus | null;
    credits: CreditBalance | null;
  } | null>;
  fetchCredits: () => Promise<CreditBalance | null>;

  // Utility functions
  isProUser: () => boolean;
  canAffordOperation: (amount: number) => boolean;

  // Reset store
  reset: () => void;
}

const initialCreditsState: CreditsState = {
  totalCredits: 0,
  subscriptionCredits: 0,
  purchasedCredits: 0,
};

const initialSubscriptionState: SubscriptionState = {
  planType: 'free',
  status: 'active',
};

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    credits: initialCreditsState,
    subscription: initialSubscriptionState,
    loading: false,
    error: null,
    isPro: false,
    isEnterprise: false,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    /**
     * Fetch subscription status and credits from app-local backend
     * This is the main initialization function
     */
    fetchSubscription: async () => {
      const token = await getAuthToken();

      if (!token) {
        set({
          credits: initialCreditsState,
          subscription: initialSubscriptionState,
          isPro: false,
          isEnterprise: false,
          loading: false,
        });
        return null;
      }

      set({ loading: true, error: null });

      try {
        const { subscription, credits } = await creditsApi.fetchSubscriptionData(token);

        const isEnterprise = subscription?.planType === 'enterprise' && subscription?.status === 'active';
        const isPro = (subscription?.planType === 'pro' || subscription?.planType === 'enterprise') && subscription?.status === 'active';

        const newCreditsState = credits ? {
          totalCredits: credits.total_credits,
          subscriptionCredits: credits.subscription_credits,
          purchasedCredits: credits.purchased_credits,
        } : initialCreditsState;

        set({
          subscription: subscription || initialSubscriptionState,
          credits: newCreditsState,
          isPro,
          isEnterprise,
          loading: false,
          error: null,
        });

        return { subscription, credits };
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch subscription',
          loading: false,
        });
        return null;
      }
    },

    /**
     * Fetch only credits (for refreshing after operations)
     */
    fetchCredits: async () => {
      const token = await getAuthToken();

      if (!token) {
        set({ credits: initialCreditsState });
        return null;
      }

      try {
        const credits = await creditsApi.getBalance(token);

        if (credits) {
          const newCreditsState = {
            totalCredits: credits.total_credits,
            subscriptionCredits: credits.subscription_credits,
            purchasedCredits: credits.purchased_credits,
          };
          set({
            credits: newCreditsState,
          });
        }

        return credits;
      } catch (error) {
        return null;
      }
    },

    /**
     * Check if user is a Pro subscriber
     */
    isProUser: () => {
      const { subscription, isPro } = get();
      return isPro || ((subscription.planType === 'pro' || subscription.planType === 'enterprise') && subscription.status === 'active');
    },

    /**
     * Check if user can afford an operation
     * @param amount - The number of credits required
     */
    canAffordOperation: (amount: number) => {
      const { credits } = get();
      return credits.totalCredits >= amount;
    },

    /**
     * Reset store to initial state
     */
    reset: () => set({
      credits: initialCreditsState,
      subscription: initialSubscriptionState,
      loading: false,
      error: null,
      isPro: false,
      isEnterprise: false,
    }),
  }))
);

// Helper hooks for subscription data
export const useSubscription = () => {
  const {
    credits,
    subscription,
    loading,
    error,
    isPro,
    isEnterprise,
    fetchSubscription,
    fetchCredits,
    isProUser,
    canAffordOperation,
    reset,
  } = useSubscriptionStore();

  return {
    // Credits
    credits,
    totalCredits: credits.totalCredits,
    subscriptionCredits: credits.subscriptionCredits,
    purchasedCredits: credits.purchasedCredits,

    // Subscription
    subscription,
    planType: subscription.planType,
    subscriptionStatus: subscription.status,

    // State
    loading,
    error,
    isPro,
    isEnterprise,

    // Actions
    fetchSubscription,
    fetchCredits,
    refreshSubscription: fetchSubscription,

    // Utilities
    isProUser,
    canAffordOperation,
    reset,

    // Computed - for backwards compatibility
    isSubscribed: subscription.planType !== 'free' && subscription.status === 'active',
    isPremium: isPro,
    currentPlan: {
      name: subscription.planType === 'enterprise' ? 'Enterprise' : subscription.planType === 'pro' ? 'Pro' : 'Free',
      planType: subscription.planType,
      status: subscription.status,
    },
  };
};

// Selector hooks for specific data
export const useCredits = () => useSubscriptionStore((state) => state.credits);
export const useIsPro = () => useSubscriptionStore((state) => state.isPro);
export const useSubscriptionLoading = () => useSubscriptionStore((state) => state.loading);
export const useSubscriptionError = () => useSubscriptionStore((state) => state.error);

export default useSubscriptionStore;
