'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Check as CheckIcon, Star as StarIcon } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PaymentForm } from './PaymentForm';

export function SubscriptionPlans() {
  const { subscriptionData, currentPlan, refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') {
      // Handle free plan selection if needed
      return;
    }
    
    setSelectedPlan(planName);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    await refreshSubscription();
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const getButtonText = (planName: string) => {
    if (currentPlan?.name === planName) {
      return 'Current Plan';
    }
    if (planName === 'Free') {
      return 'Get Started';
    }
    if (planName === 'Enterprise') {
      return 'Contact Sales';
    }
    return 'Subscribe';
  };

  const isButtonDisabled = (planName: string) => {
    return currentPlan?.name === planName;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
        Scale your task management with plans designed for teams of all sizes
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const isPopular = key === 'PRO';
          const isCurrent = currentPlan?.name === plan.name;
          
          return (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Card
                sx={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isPopular ? 2 : 1,
                  borderColor: isPopular ? 'primary.main' : 'divider',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                {isPopular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    icon={<StarIcon size={16} />}
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {plan.name}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="div" fontWeight="bold">
                      {formatPrice(plan.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per month
                    </Typography>
                  </Box>

                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon size={16} color="#4caf50" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {isCurrent && (
                    <Chip
                      label="Current Plan"
                      color="success"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Button
                    variant={isPopular ? 'contained' : 'outlined'}
                    fullWidth
                    disabled={isButtonDisabled(plan.name)}
                    onClick={() => handleSelectPlan(plan.name)}
                    sx={{ mt: 'auto' }}
                  >
                    {getButtonText(plan.name)}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Current Usage Display */}
      {subscriptionData && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Current Usage
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {subscriptionData.usage.tasksCreated} / {subscriptionData.usage.taskLimit === 999999 ? '∞' : subscriptionData.usage.taskLimit} tasks used
          </Typography>
        </Box>
      )}

      {/* Payment Modal */}
      <Dialog
        open={showPaymentModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Complete Your Subscription to {selectedPlan}
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                planName={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCloseModal}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}