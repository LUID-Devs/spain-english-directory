'use client';

import { useState } from 'react';
import ClaimModal from './ClaimModal';

interface ClaimButtonProps {
  directoryEntryId: number;
  isClaimed: boolean;
}

export default function ClaimButton({ directoryEntryId, isClaimed }: ClaimButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isClaimed) {
    return <span className="text-sm font-medium text-green-700">Claimed</span>;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-black px-3 py-2 text-sm text-white hover:opacity-90"
      >
        Claim This Listing
      </button>

      <ClaimModal
        directoryEntryId={directoryEntryId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
