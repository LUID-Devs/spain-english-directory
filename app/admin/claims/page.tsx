'use client';

import { useState, useEffect } from 'react';
import { Claim, ClaimStatus } from '@/types';

const ADMIN_KEY_STORAGE = 'admin_api_key';
const ADMIN_KEY_HEADER = 'x-admin-key';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const storedKey = window.sessionStorage.getItem(ADMIN_KEY_STORAGE);
    if (storedKey) {
      setAdminKey(storedKey);
      setIsAuthorized(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized || !adminKey) return;
    fetchClaims();
  }, [statusFilter, isAuthorized, adminKey]);

  const fetchClaims = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const url = new URL('/api/admin/claims', window.location.origin);
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter);
      }

      const response = await fetch(url, {
        headers: {
          [ADMIN_KEY_HEADER]: adminKey,
        },
      });
      const data = await response.json();

      if (response.status === 401) {
        setIsAuthorized(false);
        window.sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        throw new Error('Invalid admin key');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claims');
      }

      setClaims(data.claims);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: number) => {
    if (!adminKey) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [ADMIN_KEY_HEADER]: adminKey,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve claim');
      }

      await fetchClaims();
      setSelectedClaim(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (claimId: number) => {
    if (!adminKey) return;
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [ADMIN_KEY_HEADER]: adminKey,
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject claim');
      }

      await fetchClaims();
      setSelectedClaim(null);
      setRejectionReason('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      verified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!adminKey.trim()) {
      setError('Admin key is required');
      return;
    }

    window.sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    setIsAuthorized(true);
    setLoading(true);
  };

  if (!isAuthorized) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Claims Access</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enter the admin API key to view and manage claim requests.
        </p>
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin API Key"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Claims</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
          className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No claims found</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Listing</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Claimant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{claim.directoryEntry?.name}</div>
                    <div className="text-sm text-gray-500">
                      {claim.directoryEntry?.category} • {claim.directoryEntry?.city}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{claim.claimantName}</div>
                    <div className="text-sm text-gray-500">{claim.claimantEmail}</div>
                    {claim.claimantPhone && (
                      <div className="text-sm text-gray-500">{claim.claimantPhone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(claim.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Review Claim</h2>
                <button
                  onClick={() => {
                    setSelectedClaim(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Listing Details</h3>
                  <p><strong>Name:</strong> {selectedClaim.directoryEntry?.name}</p>
                  <p><strong>Category:</strong> {selectedClaim.directoryEntry?.category}</p>
                  <p><strong>Location:</strong> {selectedClaim.directoryEntry?.city}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Claimant Information</h3>
                  <p><strong>Name:</strong> {selectedClaim.claimantName}</p>
                  <p><strong>Email:</strong> {selectedClaim.claimantEmail}</p>
                  {selectedClaim.claimantPhone && (
                    <p><strong>Phone:</strong> {selectedClaim.claimantPhone}</p>
                  )}
                  <p><strong>Verified:</strong> {selectedClaim.isVerified ? 'Yes' : 'No'}</p>
                </div>

                {selectedClaim.documentUrl && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Verification Document</h3>
                    <a
                      href={selectedClaim.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {selectedClaim.status !== 'approved' && selectedClaim.status !== 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                      rows={3}
                      placeholder="Reason for rejection..."
                    />
                  </div>
                )}

                {selectedClaim.status !== 'approved' && selectedClaim.status !== 'rejected' ? (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleReject(selectedClaim.id)}
                      disabled={actionLoading || !selectedClaim.isVerified}
                      className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedClaim.id)}
                      disabled={actionLoading || !selectedClaim.isVerified}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    This claim has already been {selectedClaim.status}.
                  </div>
                )}

                {!selectedClaim.isVerified && selectedClaim.status !== 'approved' && selectedClaim.status !== 'rejected' && (
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 rounded-md text-sm">
                    ⚠️ Email verification required before approving or rejecting
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
