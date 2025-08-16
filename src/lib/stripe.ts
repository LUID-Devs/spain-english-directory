import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Subscription plans that match backend configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
    taskLimit: 5,
    features: [
      'Up to 5 tasks',
      'Basic project management',
      'Task assignment',
      'Comments and attachments',
    ],
  },
  STARTER: {
    name: 'Starter',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    taskLimit: 50,
    features: [
      'Up to 50 tasks',
      'Team collaboration',
      'Advanced project views',
      'Priority task management',
      'File attachments',
      'Email notifications',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    taskLimit: 500,
    features: [
      'Up to 500 tasks',
      'Multiple teams',
      'Advanced analytics',
      'Custom task fields',
      'Time tracking',
      'Gantt charts',
      'API access',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    taskLimit: -1, // Unlimited
    features: [
      'Unlimited tasks',
      'Unlimited teams',
      'Advanced security',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Advanced reporting',
      'Custom branding',
    ],
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Utility functions
export const getPlanByName = (planName: string) => {
  return SUBSCRIPTION_PLANS[planName as PlanType];
};

export const isValidPlan = (planName: string): planName is PlanType => {
  return planName in SUBSCRIPTION_PLANS;
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};