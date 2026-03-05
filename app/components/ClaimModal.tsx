'use client';

import { FormEvent, useState } from 'react';
import ClaimVerification from './ClaimVerification';

type ModalStep = 'form' | 'verify' | 'success';

interface ClaimModalProps {
  directoryEntryId: number;
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmitted?: () => void;
}

export default function ClaimModal({
  directoryEntryId,
  isOpen,
  onClose,
  onClaimSubmitted,
}: ClaimModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [claimId, setClaimId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = (): void => {
    setStep('form');
    setName('');
    setEmail('');
    setPhone('');
    setFile(null);
    setClaimId(null);
    setError(null);
  };

  const handleClose = (): void => {
    resetState();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let documentUrl: string | undefined;

      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = (await uploadResponse.json()) as {
          success: boolean;
          url?: string;
          error?: string;
        };

        if (!uploadResponse.ok || !uploadResult.success || !uploadResult.url) {
          setError(uploadResult.error ?? 'File upload failed.');
          return;
        }

        documentUrl = uploadResult.url;
      }

      const claimResponse = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directoryEntryId,
          name,
          email,
          phone,
          documentUrl,
        }),
      });

      const claimResult = (await claimResponse.json()) as {
        success: boolean;
        claimId?: number;
        error?: string;
      };

      if (!claimResponse.ok || !claimResult.success || !claimResult.claimId) {
        setError(claimResult.error ?? 'Unable to submit claim.');
        return;
      }

      setClaimId(claimResult.claimId);
      setStep('verify');
      onClaimSubmitted?.();
    } catch {
      setError('Unable to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Claim This Listing</h2>
          <button className="text-sm text-gray-500" onClick={handleClose}>
            Close
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
            <div>
              <label className="mb-1 block text-sm text-gray-600">ID/License Document (optional)</label>
              <input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full text-sm"
                accept="image/*,.pdf"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </form>
        )}

        {step === 'verify' && claimId && (
          <ClaimVerification
            claimId={claimId}
            onVerified={() => {
              setStep('success');
            }}
          />
        )}

        {step === 'success' && (
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-medium text-green-700">Email verified successfully.</p>
            <p>Your claim is now pending admin review.</p>
            <button
              onClick={handleClose}
              className="w-full rounded bg-black px-4 py-2 text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
