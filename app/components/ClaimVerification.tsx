'use client';

import { FormEvent, useState } from 'react';

interface ClaimVerificationProps {
  claimId: number;
  onVerified: () => void;
}

export default function ClaimVerification({ claimId, onVerified }: ClaimVerificationProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/claims/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, code }),
      });

      const data = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Verification failed.');
        return;
      }

      onVerified();
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
        Enter 6-digit verification code
      </label>
      <input
        id="verification-code"
        type="text"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full rounded border border-gray-300 px-3 py-2"
        placeholder="123456"
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || code.length !== 6}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Verifying...' : 'Verify Claim'}
      </button>
    </form>
  );
}
