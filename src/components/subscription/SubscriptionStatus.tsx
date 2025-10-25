'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowUp, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SubscriptionStatusProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
}

export function SubscriptionStatus({ 
  compact = false, 
  showUpgradeButton = true 
}: SubscriptionStatusProps) {
  const { subscriptionData, currentPlan, loading } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-300 h-4 w-4"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) {
    return null;
  }

  const { usage } = subscriptionData;
  const usagePercentage = usage.taskLimit === 999999 
    ? 0 
    : (usage.tasksCreated / usage.taskLimit) * 100;
  
  const isNearLimit = usagePercentage >= 80 && usage.taskLimit !== 999999;
  const isAtLimit = usagePercentage >= 100;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          label={currentPlan?.name || 'Free'}
          color={currentPlan?.name === 'Free' ? 'default' : 'primary'}
          icon={<Zap size={16} />}
          size="small"
        />
        
        {usage.taskLimit !== 999999 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {usage.tasksCreated}/{usage.taskLimit}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(usagePercentage, 100)}
              sx={{ 
                width: 60, 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'grey.200',
              }}
              color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'primary'}
            />
          </Box>
        )}

        {showUpgradeButton && currentPlan?.name === 'Free' && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowUp size={14} />}
            onClick={() => router.push('/pricing')}
          >
            Upgrade
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Plan: {currentPlan?.name || 'Free'}
            </Typography>
            {currentPlan?.price && (
              <Typography variant="body2" color="text.secondary">
                ${currentPlan.price}/month
              </Typography>
            )}
          </Box>
          
          <Chip
            label={currentPlan?.name || 'Free'}
            color={currentPlan?.name === 'Free' ? 'default' : 'primary'}
            icon={<Zap size={16} />}
          />
        </Box>

        {usage.taskLimit !== 999999 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tasks Used
              </Typography>
              <Typography variant="body2">
                {usage.tasksCreated} / {usage.taskLimit}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(usagePercentage, 100)}
              sx={{ height: 8, borderRadius: 4 }}
              color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'primary'}
            />
          </Box>
        )}

        {(isNearLimit || isAtLimit) && showUpgradeButton && (
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="body2" 
              color={isAtLimit ? 'error' : 'warning.main'}
              gutterBottom
            >
              {isAtLimit 
                ? 'You\'ve reached your task limit. Upgrade to continue creating tasks.'
                : 'You\'re approaching your task limit. Consider upgrading your plan.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowUp size={16} />}
              onClick={() => router.push('/pricing')}
              size="small"
            >
              Upgrade Plan
            </Button>
          </Box>
        )}

        {showUpgradeButton && currentPlan?.name === 'Free' && !isNearLimit && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowUp size={16} />}
              onClick={() => router.push('/pricing')}
              size="small"
            >
              Upgrade to Pro
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}