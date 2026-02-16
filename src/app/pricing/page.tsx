'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Check } from '@mui/icons-material';

const BILLING_URL = process.env.NEXT_PUBLIC_BILLING_URL || '/dashboard/settings';

const plans = [
  {
    name: 'Free',
    price: 'EUR 0',
    interval: 'month',
    description: 'For personal task management and exploration.',
    features: ['Basic tasks and projects', 'Workspace collaboration', 'Community support'],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    name: 'TaskLuid Pro',
    price: 'EUR 10',
    interval: 'month',
    description: 'App-local billing with monthly credits and premium workflows.',
    features: ['Higher credit allowance', 'AI task parsing', 'Priority support'],
    cta: 'Upgrade to Pro',
    ctaDisabled: false,
  },
];

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpgrade = () => {
    window.open(BILLING_URL, '_blank');
  };

  // Prevent hydration mismatch by rendering only after mount
  if (!mounted) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center', minHeight: '60vh' }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Chip label="TaskLuid Billing" color="primary" sx={{ mb: 2 }} />
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Simple Pricing
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto' }}>
          TaskLuid uses app-local billing with a Pro plan at EUR 10/month.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ pb: 8 }}>
        {plans.map((plan) => (
          <Grid item xs={12} md={6} key={plan.name}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold">{plan.name}</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                  {plan.price}
                  <Typography component="span" variant="body1" color="text.secondary">
                    /{plan.interval}
                  </Typography>
                </Typography>
                <Typography sx={{ mt: 2, mb: 2 }} color="text.secondary">
                  {plan.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {plan.features.map((feature) => (
                    <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Check color="success" fontSize="small" />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant={plan.ctaDisabled ? 'outlined' : 'contained'}
                  disabled={plan.ctaDisabled}
                  onClick={plan.ctaDisabled ? undefined : handleUpgrade}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
