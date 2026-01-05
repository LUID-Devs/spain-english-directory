/**
 * LuidHub Credits API
 * Handles credit balance and subscription status from LuidHub
 */

const LUIDHUB_API_URL = import.meta.env.VITE_LUIDHUB_API_URL || 'https://api.luidhub.com/api';

export interface CreditBalance {
  total_credits: number;
  subscription_credits: number;
  purchased_credits: number;
}

export interface SubscriptionStatus {
  planType: 'free' | 'pro';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreditsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get the user's credit balance from LuidHub
 * @param token - The user's Cognito access token
 * @returns The credit balance or null if failed
 */
export async function getBalance(token: string): Promise<CreditBalance | null> {
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${LUIDHUB_API_URL}/credits/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    // Handle both direct and wrapped response structures
    if (result.total_credits !== undefined) {
      return {
        total_credits: result.total_credits,
        subscription_credits: result.subscription_credits || 0,
        purchased_credits: result.purchased_credits || 0,
      };
    } else if (result.data?.total_credits !== undefined) {
      return {
        total_credits: result.data.total_credits,
        subscription_credits: result.data.subscription_credits || 0,
        purchased_credits: result.data.purchased_credits || 0,
      };
    } else if (result.success && result.data) {
      return {
        total_credits: result.data.total_credits || 0,
        subscription_credits: result.data.subscription_credits || 0,
        purchased_credits: result.data.purchased_credits || 0,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get the user's subscription status from LuidHub
 * @param token - The user's Cognito access token
 * @returns The subscription status or null if failed
 */
export async function getSubscriptionStatus(token: string): Promise<SubscriptionStatus | null> {
  if (!token) {
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
      return null;
    }

    const result = await response.json();

    // Handle both direct and wrapped response structures
    if (result.success && result.subscription) {
      return result.subscription;
    } else if (result.success && result.data) {
      return result.data;
    } else if (result.planType) {
      return result;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has enough credits for an operation
 * @param token - The user's Cognito access token
 * @param amount - The amount of credits required
 * @returns Whether the user can afford the operation
 */
export async function checkCredits(token: string, amount: number): Promise<boolean> {
  const balance = await getBalance(token);

  if (!balance) {
    // If we can't fetch balance, default to allowing the operation
    // This prevents blocking users when API is unavailable
    return true;
  }

  return balance.total_credits >= amount;
}

/**
 * Fetch both subscription status and credits in parallel
 * @param token - The user's Cognito access token
 * @returns Both subscription and credits data
 */
export async function fetchLuidHubData(token: string): Promise<{
  subscription: SubscriptionStatus | null;
  credits: CreditBalance | null;
}> {
  if (!token) {
    return { subscription: null, credits: null };
  }

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
  fetchLuidHubData,
};

export default creditsApi;
