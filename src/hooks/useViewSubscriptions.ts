import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService, ViewSubscription, ViewSubscriptionConfig } from '@/services/apiService';

interface UseViewSubscriptionsReturn {
  subscriptions: ViewSubscription[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  subscribe: (viewId: number, config?: Partial<ViewSubscriptionConfig>) => Promise<boolean>;
  unsubscribe: (viewId: number) => Promise<boolean>;
  updateSettings: (subscriptionId: number, updates: Partial<ViewSubscriptionConfig> & { isActive?: boolean }) => Promise<boolean>;
  getStatus: (viewId: number) => Promise<{ isSubscribed: boolean; subscription: ViewSubscription | null }>;
}

/**
 * Hook for managing view subscriptions
 * Allows users to subscribe to saved views and receive notifications
 */
export function useViewSubscriptions(): UseViewSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<ViewSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getMySubscriptions();
      if (response.success) {
        setSubscriptions(response.subscriptions);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch subscriptions');
      setError(error);
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const subscribe = useCallback(async (
    viewId: number,
    config?: Partial<ViewSubscriptionConfig>
  ): Promise<boolean> => {
    try {
      const response = await apiService.subscribeToView(viewId, config);
      if (response.success) {
        toast.success('Subscribed to view', {
          description: `You'll receive notifications when tasks match this view.`,
        });
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe');
      toast.error('Failed to subscribe', { description: error.message });
      return false;
    }
  }, [fetchSubscriptions]);

  const unsubscribe = useCallback(async (viewId: number): Promise<boolean> => {
    try {
      const response = await apiService.unsubscribeFromView(viewId);
      if (response.success) {
        toast.success('Unsubscribed from view');
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unsubscribe');
      toast.error('Failed to unsubscribe', { description: error.message });
      return false;
    }
  }, [fetchSubscriptions]);

  const updateSettings = useCallback(async (
    subscriptionId: number,
    updates: Partial<ViewSubscriptionConfig> & { isActive?: boolean }
  ): Promise<boolean> => {
    try {
      const response = await apiService.updateSubscriptionSettings(subscriptionId, updates);
      if (response.success) {
        toast.success('Subscription settings updated');
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update settings');
      toast.error('Failed to update settings', { description: error.message });
      return false;
    }
  }, [fetchSubscriptions]);

  const getStatus = useCallback(async (viewId: number): Promise<{ isSubscribed: boolean; subscription: ViewSubscription | null }> => {
    try {
      const response = await apiService.getSubscriptionStatus(viewId);
      return {
        isSubscribed: response.isSubscribed,
        subscription: response.subscription,
      };
    } catch (err) {
      console.error('Failed to get subscription status:', err);
      return { isSubscribed: false, subscription: null };
    }
  }, []);

  return {
    subscriptions,
    isLoading,
    error,
    refetch: fetchSubscriptions,
    subscribe,
    unsubscribe,
    updateSettings,
    getStatus,
  };
}

export default useViewSubscriptions;
