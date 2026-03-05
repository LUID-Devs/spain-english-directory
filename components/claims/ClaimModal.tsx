'use client';

import { useState } from 'react';
import { ClaimFormData } from '@/types';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingName: string;
}

type Step = 'info' | 'upload' | 'verify' | 'success';

export default function ClaimModal({
  isOpen,
  onClose,
  listingId,
  listingName,
}: ClaimModalProps) {
  const [step, setStep] = useState<Step>('info');
  const [formData, setFormData] = useState<ClaimFormData>({
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    documentUrl: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [claimId, setClaimId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.claimantName || !formData.claimantEmail) {
      setError('Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.claimantEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setStep('upload');
  };

  const handleUploadSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directoryEntryId: listingId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create claim');
      }

      setClaimId(data.claimId);
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claims/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify');
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'document');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, documentUrl: data.url }));
    } catch (err: any) {
      setError('Failed to upload file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!claimId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/claims/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend code');
      }

      setError('');
      alert('New verification code sent!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('info');
    setFormData({ claimantName: '', claimantEmail: '', claimantPhone: '', documentUrl: '' });
    setVerificationCode('');
    setClaimId(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold">Claim {listingName}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-center gap-2 p-4">
          {['info', 'upload', 'verify'].map((s, i) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : step === 'success' || ['upload', 'verify'].indexOf(step) > i
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {step === 'success' || ['upload', 'verify'].indexOf(step) > i ? '✓' : i + 1}
            </div>
          ))}
        </div>

        {error && (
          <div className="mx-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {step === 'info' && (
          <form onSubmit={handleInfoSubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your contact information to claim this listing.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.claimantName}
                onChange={(e) => setFormData(prev => ({ ...prev, claimantName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.claimantEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, claimantEmail: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.claimantPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, claimantPhone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                placeholder="+34 612 345 678"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </form>
        )}

        {step === 'upload' && (
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a business license, ID, or other document to verify your ownership.
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="document-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer block"
              >
                {formData.documentUrl ? (
                  <div className="text-green-600">
                    <p>✓ Document uploaded</p>
                    <p className="text-sm text-gray-500">Click to change</p>
                  </div>
                ) : isLoading ? (
                  <div>
                    <p>Uploading...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Click to upload document</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or PDF up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('info')}
                className="flex-1 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Back
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Upload is optional but helps verify your claim faster.
            </p>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="p-4 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a 6-digit verification code to{' '}
              <strong>{formData.claimantEmail}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border rounded-md text-center text-2xl tracking-[0.5em] dark:bg-gray-800 dark:border-gray-700"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="w-full text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="p-4 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-semibold">Claim Submitted!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your claim is now pending review. We'll notify you once it's approved.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
