'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  DialogActions,
} from '@mui/material';
import {
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import { subscriptionApi } from '@/lib/subscription-api';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe';

interface PaymentFormProps {
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export function PaymentForm({ planName, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Failed to create payment method');
        setLoading(false);
        return;
      }

      // Create subscription
      const result = await subscriptionApi.createSubscription(
        plan.priceId!,
        paymentMethod.id
      );

      if (result.subscription.clientSecret) {
        // Confirm payment if needed
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.subscription.clientSecret
        );

        if (confirmError) {
          setError(confirmError.message || 'Payment confirmation failed');
          setLoading(false);
          return;
        }
      }

      onSuccess();
    } catch (err: unknown) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          {plan.name} Plan
        </Typography>
        <Typography variant="h4" color="primary">
          {formatPrice(plan.price)}/month
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Billed monthly • Cancel anytime
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Payment Information
        </Typography>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
            p: 2,
            '&:focus-within': {
              borderColor: 'primary.main',
            },
          }}
        >
          <CardElement options={cardElementOptions} />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Your payment information is secured by Stripe. You can cancel your subscription at any time.
        </Typography>
      </Box>

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : `Subscribe for ${formatPrice(plan.price)}/month`}
        </Button>
      </DialogActions>
    </Box>
  );
}