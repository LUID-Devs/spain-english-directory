'use client';

import { useState } from 'react';

interface ClaimButtonProps {
  listingId: number;
  claimStatus?: string;
  onClaimClick: () => void;
}

export default function ClaimButton({ listingId, claimStatus, onClaimClick }: ClaimButtonProps) {
  const getButtonContent = () => {
    switch (claimStatus) {
      case 'pending':
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verification Pending
          </>
        );
      case 'verified':
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending Admin Approval
          </>
        );
      case 'approved':
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Claimed ✓
          </>
        );
      case 'rejected':
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Claim Again
          </>
        );
      default:
        return (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Claim This Listing
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all";
    
    switch (claimStatus) {
      case 'pending':
        return `${baseStyles} bg-yellow-100 text-yellow-700 cursor-default`;
      case 'verified':
        return `${baseStyles} bg-blue-100 text-blue-700 cursor-default`;
      case 'approved':
        return `${baseStyles} bg-green-100 text-green-700 cursor-default`;
      case 'rejected':
        return `${baseStyles} bg-red-100 text-red-700 hover:bg-red-200`;
      default:
        return `${baseStyles} bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow`;
    }
  };

  return (
    <button
      onClick={claimStatus === 'unclaimed' || claimStatus === 'rejected' || !claimStatus ? onClaimClick : undefined}
      className={getButtonStyles()}
      disabled={claimStatus === 'pending' || claimStatus === 'verified' || claimStatus === 'approved'}
    >
      {getButtonContent()}
    </button>
  );
}
