'use client';

import React from 'react';
import {
  Zap,
  ExternalLink,
  Crown,
  Check,
  Coins,
  CreditCard,
} from 'lucide-react';
import { useSubscription } from '@/stores/subscriptionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BILLING_URL = import.meta.env.VITE_BILLING_URL || '/pricing';
const BILLING_MANAGE_URL = import.meta.env.VITE_BILLING_MANAGE_URL || BILLING_URL;

export function SubscriptionDashboard() {
  const {
    loading,
    isPro,
    planType,
    totalCredits,
    subscriptionCredits,
    purchasedCredits,
  } = useSubscription();

  const isFree = planType === 'free';

  // Skeleton loading state
  if (loading) {
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
      {/* Billing Notice */}
      <Alert className="border-primary/30 bg-primary/5">
        <ExternalLink className="h-4 w-4 text-primary" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-sm">
            Your TaskLuid subscription is managed directly in TaskLuid billing.
            {isFree && ' Upgrade to Pro for more monthly credits and premium features.'}
          </span>
          {isFree && (
            <Button
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => window.open(BILLING_URL, '_blank')}
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
                  {isPro ? 'Pro' : 'Free'}
                </h3>
                {isPro && (
                  <Badge className="bg-gray-500">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isPro
                  ? 'Full access to all LUID apps and premium features'
                  : 'Basic access with limited credits'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isFree ? (
                <Button
                  onClick={() => window.open(BILLING_URL, '_blank')}
                  className="gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => window.open(BILLING_MANAGE_URL, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Manage Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credit Balance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-bold text-primary">
                  {totalCredits.toLocaleString()}
                </h3>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subscription Credits</span>
                <span className="font-medium">{subscriptionCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purchased Credits</span>
                <span className="font-medium">{purchasedCredits.toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => window.open(BILLING_MANAGE_URL, '_blank')}
              className="gap-2 w-full"
            >
              <CreditCard className="h-4 w-4" />
              Buy More Credits
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pro Benefits - Show only for free users */}
      {isFree && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-gray-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-gray-500" />
              Upgrade to TaskLuid Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Unlimited tasks and projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Monthly credit allowance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Team collaboration</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Advanced workspace limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">AI-powered features</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => window.open(BILLING_URL, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View TaskLuid Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
