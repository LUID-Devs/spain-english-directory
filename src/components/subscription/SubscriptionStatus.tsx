import React from 'react';
import { ArrowUp, Zap, Coins } from 'lucide-react';
import { useSubscription } from '@/stores/subscriptionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LUIDHUB_PRICING_URL = import.meta.env.VITE_LUIDHUB_URL
  ? `${import.meta.env.VITE_LUIDHUB_URL}/pricing`
  : 'https://luidhub.com/pricing';

interface SubscriptionStatusProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
}

export function SubscriptionStatus({
  compact = false,
  showUpgradeButton = true,
}: SubscriptionStatusProps) {
  const {
    loading,
    isPro,
    planType,
    totalCredits,
  } = useSubscription();

  const isFree = planType === 'free';
  const planName = isPro ? 'Pro' : 'Free';

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <Badge
          variant={isFree ? 'secondary' : 'default'}
          className="gap-1"
        >
          <Zap size={14} />
          {planName}
        </Badge>

        <div className="flex items-center gap-2">
          <Coins size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {totalCredits.toLocaleString()} credits
          </span>
        </div>

        {showUpgradeButton && isFree && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(LUIDHUB_PRICING_URL, '_blank')}
          >
            <ArrowUp size={14} className="mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Current Plan: {planName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isPro
                ? 'Full access to all features'
                : 'Limited access - upgrade for more'}
            </p>
          </div>

          <Badge
            variant={isFree ? 'secondary' : 'default'}
            className="gap-1"
          >
            <Zap size={14} />
            {planName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Credit Balance */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-primary" />
              <span className="text-sm font-medium">Credit Balance</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {totalCredits.toLocaleString()}
            </span>
          </div>
        </div>

        {showUpgradeButton && isFree && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => window.open(LUIDHUB_PRICING_URL, '_blank')}
              size="sm"
            >
              <ArrowUp size={14} className="mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
