/**
 * TaskLuid credits/subscription API (app-local backend).
 */

import { limitedFetch } from '@/services/limitedFetch';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const buildUrl = (path: string): string => `${API_BASE_URL}${path}`;

export interface CreditBalance {
  total_credits: number;
  subscription_credits: number;
  purchased_credits: number;
}

export interface SubscriptionStatus {
  planType: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreditsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getBalance(token: string): Promise<CreditBalance | null> {
  if (!token) return null;

  try {
    const response = await limitedFetch(buildUrl('/credits/balance'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (result?.data) {
      return {
        total_credits: result.data.total_credits || 0,
        subscription_credits: result.data.subscription_credits || 0,
        purchased_credits: result.data.purchased_credits || 0,
      };
    }

    if (result?.total_credits !== undefined) {
      return {
        total_credits: result.total_credits || 0,
        subscription_credits: result.subscription_credits || 0,
        purchased_credits: result.purchased_credits || 0,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSubscriptionStatus(token: string): Promise<SubscriptionStatus | null> {
  if (!token) return null;

  try {
    const response = await limitedFetch(buildUrl('/credits/subscription-status'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const result = await response.json();
    const data = result?.data || result;
    if (!data) return null;

    const plan = data.planType || data.plan || 'free';
    const normalizedPlan = plan === 'enterprise' ? 'enterprise' : plan === 'pro' ? 'pro' : 'free';
    return {
      planType: normalizedPlan,
      status: data.status || 'inactive',
      currentPeriodEnd: data.current_period_end || data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancel_at_period_end || data.cancelAtPeriodEnd,
    };
  } catch {
    return null;
  }
}

export async function checkCredits(token: string, amount: number): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await limitedFetch(buildUrl(`/credits/check?amount=${amount}`), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return false;
    const result = await response.json();
    return Boolean(result?.data?.has_credits);
  } catch {
    return false;
  }
}

export async function fetchSubscriptionData(token: string): Promise<{
  subscription: SubscriptionStatus | null;
  credits: CreditBalance | null;
}> {
  if (!token) return { subscription: null, credits: null };

  const [subscription, credits] = await Promise.all([
    getSubscriptionStatus(token),
    getBalance(token),
  ]);

  return { subscription, credits };
}

export const creditsApi = {
  getBalance,
  getSubscriptionStatus,
  checkCredits,
  fetchSubscriptionData,
};

export default creditsApi;
