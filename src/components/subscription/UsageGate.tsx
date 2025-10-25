'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
} from '@mui/material';
import { ArrowUp } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionPlans } from './SubscriptionPlans';

interface UsageGateProps {
  children: React.ReactNode;
  feature?: string;
  requiresPremium?: boolean;
}

export function UsageGate({ children, feature = 'task creation', requiresPremium = false }: UsageGateProps) {
  const { subscriptionData, canCreateTask, isPremium } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [canProceed, setCanProceed] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Check if user can proceed with the action
  const checkAccess = useCallback(async () => {
    if (requiresPremium && !isPremium) {
      setCanProceed(false);
      return;
    }

    if (feature === 'task creation') {
      setIsChecking(true);
      try {
        const result = await canCreateTask();
        setCanProceed(result.canCreate);
      } catch (error) {
        console.error('Error checking task creation access:', error);
        setCanProceed(true); // Allow on error
      } finally {
        setIsChecking(false);
      }
    }
  }, [requiresPremium, isPremium, feature, canCreateTask]);

  useEffect(() => {
    checkAccess();
  }, [subscriptionData, requiresPremium, feature, checkAccess]);

  // Render children with click handler that checks access
  const handleAction = (originalHandler?: () => void) => {
    return async (event: Event) => {
      event.preventDefault();
      
      await checkAccess();
      
      if (!canProceed) {
        setShowUpgradeModal(true);
        return;
      }

      // If access is allowed, call the original handler
      if (originalHandler) {
        originalHandler();
      }
    };
  };

  // Clone children and add click handler
  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as { onClick?: () => void; disabled?: boolean };
      const originalOnClick = childProps.onClick;
      return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        onClick: handleAction(originalOnClick),
        disabled: childProps.disabled || isChecking,
      });
    }
    return child;
  });

  const getUsageInfo = () => {
    if (!subscriptionData) return null;

    const { usage } = subscriptionData;
    const percentage = usage.taskLimit === 999999 
      ? 0 
      : (usage.tasksCreated / usage.taskLimit) * 100;

    return {
      current: usage.tasksCreated,
      limit: usage.taskLimit === 999999 ? '∞' : usage.taskLimit,
      percentage: Math.min(percentage, 100),
      isNearLimit: percentage >= 80,
      isAtLimit: percentage >= 100,
    };
  };

  const usageInfo = getUsageInfo();

  return (
    <>
      {wrappedChildren}

      {/* Usage warning for near limit */}
      {usageInfo?.isNearLimit && !usageInfo.isAtLimit && (
        <Alert 
          severity="warning" 
          sx={{ mt: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade
            </Button>
          }
        >
          You&apos;re approaching your task limit ({usageInfo.current}/{usageInfo.limit})
        </Alert>
      )}

      {/* Upgrade Modal */}
      <Dialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArrowUp size={24} />
          {requiresPremium ? 'Premium Feature Required' : 'Upgrade Required'}
        </DialogTitle>
        
        <DialogContent>
          {requiresPremium ? (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                This feature requires a premium subscription.
              </Alert>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You&apos;ve reached your task limit. Upgrade to continue creating tasks.
              </Alert>
              
              {usageInfo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Usage
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={usageInfo.percentage}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                      color={usageInfo.isAtLimit ? 'error' : 'warning'}
                    />
                    <Typography variant="body2">
                      {usageInfo.current}/{usageInfo.limit}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <SubscriptionPlans />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowUpgradeModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}