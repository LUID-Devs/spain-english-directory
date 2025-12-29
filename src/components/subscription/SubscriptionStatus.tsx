import React from 'react';
import { ArrowUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/stores/subscriptionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SubscriptionStatusProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
}

export function SubscriptionStatus({ 
  compact = false, 
  showUpgradeButton = true 
}: SubscriptionStatusProps) {
  const { subscriptionData, currentPlan, loading } = useSubscription();
  const navigate = useNavigate();

  // Provide fallback data
  const defaultData = {
    subscription: {
      name: 'Free',
      price: 0,
      taskLimit: 5,
      features: ['Up to 5 tasks', 'Basic project management', 'Email support']
    },
    usage: {
      tasksCreated: 0,
      taskLimit: 5,
      remaining: 5
    }
  };

  const dataToUse = subscriptionData || defaultData;
  const planToUse = currentPlan || dataToUse.subscription;
  const { usage } = dataToUse;
  const usagePercentage = usage.taskLimit === 999999 
    ? 0 
    : (usage.tasksCreated / usage.taskLimit) * 100;
  
  const isNearLimit = usagePercentage >= 80 && usage.taskLimit !== 999999;
  const isAtLimit = usagePercentage >= 100;

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <Badge 
          variant={planToUse?.name === 'Free' ? 'secondary' : 'default'}
          className="gap-1"
        >
          <Zap size={14} />
          {planToUse?.name || 'Free'}
        </Badge>
        
        {usage.taskLimit !== 999999 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {usage.tasksCreated}/{usage.taskLimit}
            </span>
            <Progress
              value={Math.min(usagePercentage, 100)}
              className={cn(
                "w-16 h-1",
                isAtLimit ? "text-destructive" : 
                isNearLimit ? "text-yellow-500" : "text-primary"
              )}
            />
          </div>
        )}

        {showUpgradeButton && planToUse?.name === 'Free' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://luidhub.com/pricing', '_blank')}
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
              Current Plan: {planToUse?.name || 'Free'}
            </CardTitle>
            {planToUse?.price && planToUse.price > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                ${planToUse.price}/month
              </p>
            )}
          </div>
          
          <Badge 
            variant={planToUse?.name === 'Free' ? 'secondary' : 'default'}
            className="gap-1"
          >
            <Zap size={14} />
            {planToUse?.name || 'Free'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {usage.taskLimit !== 999999 && (
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Tasks Used
              </span>
              <span className="text-sm font-medium">
                {usage.tasksCreated} / {usage.taskLimit}
              </span>
            </div>
            <Progress
              value={Math.min(usagePercentage, 100)}
              className={cn(
                "h-2",
                isAtLimit ? "[&>div]:bg-destructive" : 
                isNearLimit ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"
              )}
            />
          </div>
        )}

        {(isNearLimit || isAtLimit) && showUpgradeButton && (
          <div className="mt-4 p-4 rounded-lg bg-muted">
            <p className={cn(
              "text-sm mb-3",
              isAtLimit ? "text-destructive" : "text-yellow-600"
            )}>
              {isAtLimit 
                ? 'You\'ve reached your task limit. Upgrade to continue creating tasks.'
                : 'You\'re approaching your task limit. Consider upgrading your plan.'
              }
            </p>
            <Button
              onClick={() => window.open('https://luidhub.com/pricing', '_blank')}
              size="sm"
            >
              <ArrowUp size={14} className="mr-2" />
              Upgrade Plan
            </Button>
          </div>
        )}

        {showUpgradeButton && planToUse?.name === 'Free' && !isNearLimit && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://luidhub.com/pricing', '_blank')}
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