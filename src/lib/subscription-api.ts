import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with auth
const createAuthenticatedAxios = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export interface SubscriptionPlan {
  name: string;
  price: number;
  priceId?: string; // Optional for free plans
  taskLimit: number;
  features: readonly string[];
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentMethod {
  id: number;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface SubscriptionData {
  subscription: SubscriptionPlan;
  usage: {
    tasksCreated: number;
    taskLimit: number;
    remaining: number | 'unlimited';
  };
  paymentMethods: PaymentMethod[];
}

export const subscriptionApi = {
  // Get subscription plans
  async getPlans() {
    const api = createAuthenticatedAxios();
    const response = await api.get('/subscription/plans');
    return response.data;
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<SubscriptionData> {
    const api = createAuthenticatedAxios();
    const response = await api.get('/subscription/current');
    return response.data;
  },

  // Create subscription
  async createSubscription(priceId: string, paymentMethodId?: string) {
    const api = createAuthenticatedAxios();
    const response = await api.post('/subscription/create', {
      priceId,
      paymentMethodId,
    });
    return response.data;
  },

  // Update subscription
  async updateSubscription(priceId: string) {
    const api = createAuthenticatedAxios();
    const response = await api.put('/subscription/update', {
      priceId,
    });
    return response.data;
  },

  // Cancel subscription
  async cancelSubscription(immediately = false) {
    const api = createAuthenticatedAxios();
    const response = await api.post('/subscription/cancel', {
      immediately,
    });
    return response.data;
  },

  // Payment methods
  async createSetupIntent() {
    const api = createAuthenticatedAxios();
    const response = await api.post('/subscription/setup-intent');
    return response.data;
  },

  async addPaymentMethod(paymentMethodId: string) {
    const api = createAuthenticatedAxios();
    const response = await api.post('/subscription/payment-methods', {
      paymentMethodId,
    });
    return response.data;
  },

  async removePaymentMethod(paymentMethodId: string) {
    const api = createAuthenticatedAxios();
    const response = await api.delete(`/subscription/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  // Billing portal
  async createBillingPortal(returnUrl?: string) {
    const api = createAuthenticatedAxios();
    const response = await api.post('/subscription/billing-portal', {
      returnUrl,
    });
    return response.data;
  },

  // Check task creation ability
  async checkTaskCreation() {
    const api = createAuthenticatedAxios();
    const response = await api.get('/subscription/check-task-creation');
    return response.data;
  },
};