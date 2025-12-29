'use client';

import React from 'react';
import {
  Zap,
  AlertCircle,
  ExternalLink,
  Crown,
  Check,
} from 'lucide-react';
import { useSubscription } from '@/stores/subscriptionStore';
import { formatPrice } from '@/lib/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const LUIDHUB_PRICING_URL = 'https://luidhub.com/pricing';
const LUIDHUB_ACCOUNT_URL = 'https://luidhub.com/account';

export function SubscriptionDashboard() {
  const { subscriptionData, loading: subscriptionLoading } = useSubscription();

  // Provide fallback data
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
  const { subscription, usage } = dataToUse;
  const usagePercentage = usage.taskLimit === 999999
    ? 0
    : (usage.tasksCreated / usage.taskLimit) * 100;

  const isFree = subscription.name === 'Free';

  // Skeleton loading state
  if (subscriptionLoading && !subscriptionData) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-52 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-52 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* LuidHub Integration Notice */}
      <Alert className="border-primary/30 bg-primary/5">
        <ExternalLink className="h-4 w-4 text-primary" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-sm">
            Your TaskLuid subscription is managed through <strong>LuidHub</strong>.
            Upgrade to Pro for unlimited tasks and premium features across all LUID apps.
          </span>
          {isFree && (
            <Button
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => window.open(LUIDHUB_PRICING_URL, '_blank')}
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
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
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-primary">
                  {subscription.name}
                </h3>
                {!isFree && (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">
                {formatPrice(subscription.price)}/month
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isFree ? (
                <Button
                  onClick={() => window.open(LUIDHUB_PRICING_URL, '_blank')}
                  className="gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => window.open(LUIDHUB_ACCOUNT_URL, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage in LuidHub
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
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {usagePercentage >= 100
                    ? "You've reached your task limit. Upgrade to continue."
                    : "You're approaching your task limit."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Plan Features</p>
              {subscription.features?.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Benefits - Show only for free users */}
      {isFree && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade to LuidHub Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Team collaboration</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Access to all LUID apps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI-powered features</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => window.open(LUIDHUB_PRICING_URL, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Plans on LuidHub
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
