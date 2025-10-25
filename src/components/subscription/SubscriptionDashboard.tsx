'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  CreditCard,
  Zap,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { subscriptionApi } from '@/lib/subscription-api';
import { formatPrice } from '@/lib/stripe';
import { SubscriptionPlans } from './SubscriptionPlans';

export function SubscriptionDashboard() {
  const { subscriptionData, refreshSubscription } = useSubscription();
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const result = await subscriptionApi.createBillingPortal(
        `${window.location.origin}/dashboard/settings`
      );
      window.open(result.url, '_blank');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open billing portal';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await subscriptionApi.cancelSubscription(false); // Cancel at period end
      await refreshSubscription();
      setShowCancelModal(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!subscriptionData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const { subscription, usage, paymentMethods } = subscriptionData;
  const usagePercentage = usage.taskLimit === 999999 
    ? 0 
    : (usage.tasksCreated / usage.taskLimit) * 100;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Subscription & Billing
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Plan */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Zap size={20} />
                <Typography variant="h6">Current Plan</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="h4" color="primary">
                  {subscription.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {formatPrice(subscription.price)}/month
                </Typography>
              </Box>

              {subscription.status && subscription.status !== 'active' && (
                <Chip
                  label={subscription.status}
                  color={subscription.status === 'canceled' ? 'error' : 'warning'}
                  sx={{ mb: 2 }}
                />
              )}

              {subscription.cancelAtPeriodEnd && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Your subscription will end on{' '}
                  {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), 'PPP')}
                </Alert>
              )}

              {subscription.currentPeriodEnd && subscription.status === 'active' && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Next billing date: {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                </Typography>
              )}

              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={() => setShowPlansModal(true)}
                >
                  Change Plan
                </Button>
                
                {subscription.name !== 'Free' && (
                  <Button
                    variant="outlined"
                    onClick={handleManageBilling}
                    disabled={loading}
                    startIcon={<ExternalLink size={16} />}
                  >
                    Manage Billing
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AlertCircle size={20} />
                <Typography variant="h6">Usage</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tasks Created
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(usagePercentage, 100)}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    color={usagePercentage >= 100 ? 'error' : usagePercentage >= 80 ? 'warning' : 'primary'}
                  />
                  <Typography variant="body2">
                    {usage.tasksCreated}/{usage.taskLimit === 999999 ? '∞' : usage.taskLimit}
                  </Typography>
                </Box>
              </Box>

              {usagePercentage >= 80 && usage.taskLimit !== 999999 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You&apos;re approaching your task limit. Consider upgrading your plan.
                </Alert>
              )}

              <List>
                {subscription.features.slice(0, 3).map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText 
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CreditCard size={20} />
                  <Typography variant="h6">Payment Methods</Typography>
                </Box>

                <List>
                  {paymentMethods.map((method) => (
                    <ListItem key={method.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={`**** **** **** ${method.last4}`}
                        secondary={`${method.brand?.toUpperCase()} • Expires ${method.expiryMonth}/${method.expiryYear}`}
                      />
                      {method.isDefault && (
                        <Chip label="Default" size="small" />
                      )}
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant="outlined"
                  onClick={handleManageBilling}
                  disabled={loading}
                  startIcon={<ExternalLink size={16} />}
                >
                  Manage Payment Methods
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Cancel Subscription */}
        {subscription.name !== 'Free' && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cancel Subscription
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Cancel your subscription at any time. You&apos;ll continue to have access to your plan features until the end of your billing period.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Change Plans Modal */}
      <Dialog
        open={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Change Your Plan</DialogTitle>
        <DialogContent>
          <SubscriptionPlans />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPlansModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel your subscription?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You&apos;ll continue to have access to your {subscription.name} plan features until{' '}
            {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), 'PPP')}.
            After that, your account will be downgraded to the Free plan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelModal(false)}>
            Keep Subscription
          </Button>
          <Button
            onClick={handleCancelSubscription}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Canceling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}