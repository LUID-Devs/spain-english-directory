'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { useSubscription } from '@/stores/subscriptionStore';
import { subscriptionApi } from '@/lib/subscription-api';
import { formatPrice } from '@/lib/stripe';
import { SubscriptionPlans } from './SubscriptionPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function SubscriptionDashboard() {
  const { subscriptionData, refreshSubscription, loading: subscriptionLoading, error: subscriptionError } = useSubscription();
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

  // Provide fallback data if subscription is loading or has error
  const defaultSubscriptionData = {
    subscription: {
      name: 'Free',
      price: 0,
      taskLimit: 5,
      features: ['Up to 5 tasks', 'Basic project management', 'Email support'],
      status: 'active'
    },
    usage: {
      tasksCreated: 0,
      taskLimit: 5,
      remaining: 5
    },
    paymentMethods: []
  };

  const dataToUse = subscriptionData || defaultSubscriptionData;
  const { subscription, usage, paymentMethods } = dataToUse;
  const usagePercentage = usage.taskLimit === 999999 
    ? 0 
    : (usage.tasksCreated / usage.taskLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Loading state indicator - only show for first 3 seconds */}
      {subscriptionLoading && !subscriptionData && (
        <Alert className="mb-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <AlertDescription>
              Loading subscription data...
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Error state */}
      {(error || subscriptionError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || subscriptionError}
            {!subscriptionData && " (Showing default Free plan)"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">{" "}
        {/* Current Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-primary">
                {subscription.name}
              </h3>
              <p className="text-lg text-muted-foreground">
                {formatPrice(subscription.price)}/month
              </p>
            </div>

            {subscription.status && subscription.status !== 'active' && (
              <Badge
                variant={subscription.status === 'canceled' ? 'destructive' : 'secondary'}
              >
                {subscription.status}
              </Badge>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will end on{' '}
                  {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), 'PPP')}
                </AlertDescription>
              </Alert>
            )}

            {subscription.currentPeriodEnd && subscription.status === 'active' && (
              <p className="text-sm text-muted-foreground">
                Next billing date: {format(new Date(subscription.currentPeriodEnd), 'PPP')}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPlansModal(true)}
              >
                Change Plan
              </Button>
              
              {subscription.name !== 'Free' && (
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={loading}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage Billing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Tasks Created
              </p>
              <div className="flex items-center gap-3">
                <Progress
                  value={Math.min(usagePercentage, 100)}
                  className={cn(
                    "flex-1 h-2",
                    usagePercentage >= 100 ? "[&>div]:bg-destructive" :
                    usagePercentage >= 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"
                  )}
                />
                <span className="text-sm font-medium">
                  {usage.tasksCreated}/{usage.taskLimit === 999999 ? '∞' : usage.taskLimit}
                </span>
              </div>
            </div>

            {usagePercentage >= 80 && usage.taskLimit !== 999999 && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You&apos;re approaching your task limit. Consider upgrading your plan.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {subscription.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">**** **** **** {method.last4}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.brand?.toUpperCase()} • Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={loading}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Manage Payment Methods
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription */}
      {subscription.name !== 'Free' && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
        <Card>
          <CardHeader>
            <CardTitle>Cancel Subscription</CardTitle>
            <CardDescription>
              Cancel your subscription at any time. You&apos;ll continue to have access to your plan features until the end of your billing period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Change Plans Modal */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Change Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs
            </DialogDescription>
          </DialogHeader>
          <SubscriptionPlans />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlansModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You&apos;ll continue to have access to your {subscription.name} plan features until{' '}
              {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), 'PPP')}.
              After that, your account will be downgraded to the Free plan.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              {loading ? 'Canceling...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}