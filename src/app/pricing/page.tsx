'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';

export default function PricingPage() {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionProvider>
        <Container maxWidth="lg">
          <Box sx={{ py: 6 }}>
            <Typography variant="h2" component="h1" textAlign="center" gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
              Choose the perfect plan for your team. Upgrade or downgrade at any time.
            </Typography>
            
            <SubscriptionPlans />
            
            {/* FAQ Section */}
            <Box sx={{ mt: 8 }}>
              <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
                Frequently Asked Questions
              </Typography>
              
              <Box sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Can I change plans at any time?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    What happens if I exceed my task limit?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You'll be prompted to upgrade your plan when you reach your task limit. Your existing tasks will remain accessible.
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Is there a free trial?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Yes! You can start with our Free plan and upgrade when you need more features. No credit card required to get started.
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    How secure is my payment information?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We use Stripe to process payments, which means your payment information is encrypted and secure. We never store your card details on our servers.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </SubscriptionProvider>
    </Elements>
  );
}