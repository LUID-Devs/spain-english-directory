'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { ArrowUp, Crown, ExternalLink, Coins } from 'lucide-react';
import { useSubscription } from '@/stores/subscriptionStore';

const LUIDHUB_PRICING_URL = import.meta.env.VITE_LUIDHUB_URL
  ? `${import.meta.env.VITE_LUIDHUB_URL}/pricing`
  : 'https://luidhub.com/pricing';

interface UsageGateProps {
  children: React.ReactNode;
  feature?: string;
  requiresPro?: boolean;
  creditsRequired?: number;
}

export function UsageGate({
  children,
  feature = 'this feature',
  requiresPro = false,
  creditsRequired = 0,
}: UsageGateProps) {
  const {
    isPro,
    totalCredits,
    canAffordOperation,
  } = useSubscription();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [blockReason, setBlockReason] = useState<'pro' | 'credits' | null>(null);

  // Check if user can proceed with the action
  const checkAccess = useCallback((): boolean => {
    // Check Pro requirement
    if (requiresPro && !isPro) {
      setBlockReason('pro');
      return false;
    }

    // Check credits requirement
    if (creditsRequired > 0 && !canAffordOperation(creditsRequired)) {
      setBlockReason('credits');
      return false;
    }

    return true;
  }, [requiresPro, isPro, creditsRequired, canAffordOperation]);

  // Render children with click handler that checks access
  const handleAction = (originalHandler?: () => void) => {
    return (event: React.MouseEvent) => {
      const hasAccess = checkAccess();

      if (!hasAccess) {
        event.preventDefault();
        event.stopPropagation();
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
      });
    }
    return child;
  });

  const handleUpgrade = () => {
    window.open(LUIDHUB_PRICING_URL, '_blank');
    setShowUpgradeModal(false);
  };

  return (
    <>
      {wrappedChildren}

      {/* Upgrade Modal */}
      <Dialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {blockReason === 'pro' ? (
            <>
              <Crown size={24} />
              Pro Feature Required
            </>
          ) : (
            <>
              <Coins size={24} />
              Insufficient Credits
            </>
          )}
        </DialogTitle>

        <DialogContent>
          {blockReason === 'pro' ? (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>{feature}</strong> requires a LuidHub Pro subscription.
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Upgrade to LuidHub Pro to unlock:
              </Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Unlimited tasks and projects</li>
                <li>Monthly credit allowance</li>
                <li>Access to all LUID apps</li>
                <li>AI-powered features</li>
                <li>Priority support</li>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You need <strong>{creditsRequired} credits</strong> for this operation,
                but you only have <strong>{totalCredits} credits</strong>.
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Get more credits by:
              </Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Upgrading to LuidHub Pro for monthly credits</li>
                <li>Purchasing additional credit packs</li>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowUpgradeModal(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            variant="contained"
            startIcon={<ExternalLink size={16} />}
          >
            {blockReason === 'pro' ? 'Upgrade to Pro' : 'Get Credits on LuidHub'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
