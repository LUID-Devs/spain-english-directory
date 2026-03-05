'use client';

import { useState } from 'react';
import ClaimModal from './ClaimModal';

interface ClaimButtonProps {
  listingId: number;
  listingName: string;
  isClaimed?: boolean;
  variant?: 'button' | 'link';
  className?: string;
}

export default function ClaimButton({
  listingId,
  listingName,
  isClaimed = false,
  variant = 'button',
  className = '',
}: ClaimButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isClaimed) {
    return (
      <span className={`text-sm text-green-600 flex items-center gap-1 ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Claimed
      </span>
    );
  }

  if (variant === 'link') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`text-blue-600 hover:underline text-sm ${className}`}
        >
          Claim this listing
        </button>
        <ClaimModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          listingId={listingId}
          listingName={listingName}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Claim This Listing
      </button>
      <ClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listingId={listingId}
        listingName={listingName}
      />
    </>
  );
}
