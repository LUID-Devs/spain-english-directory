'use client';

import React from 'react';
import { Crown, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const BILLING_URL = import.meta.env.VITE_BILLING_URL || '/pricing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  features?: string[];
  ctaText?: string;
}

/**
 * UpgradeModal - A reusable modal for prompting users to upgrade to Pro
 *
 * Usage:
 * ```tsx
 * <UpgradeModal
 *   isOpen={showUpgradeModal}
 *   onClose={() => setShowUpgradeModal(false)}
 *   title="Unlock Unlimited Projects"
 *   message="Free users are limited to 1 project."
 * />
 * ```
 */
export function UpgradeModal({
  isOpen,
  onClose,
  title = 'Upgrade to TaskLuid Pro',
  message = 'Unlock premium features with your TaskLuid Pro subscription.',
  features = [
    'Unlimited projects and tasks',
    'AI-powered task suggestions',
    'Advanced analytics and reporting',
    'Priority support',
    'Priority support',
  ],
  ctaText = 'View TaskLuid Plans',
}: UpgradeModalProps) {
  const handleUpgrade = () => {
    window.open(BILLING_URL, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Crown className="h-5 w-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Pro Badge Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-3 text-center">
                Included with Pro:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              EUR 10/month - TaskLuid Pro
            </p>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;
