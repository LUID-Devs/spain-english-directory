'use client';

import { useState, useEffect } from 'react';

interface Claim {
  id: number;
  name: string;
  category: string;
  city: string;
  email: string;
  phone: string;
  claimStatus: string;
  claimedBy: string;
  claimEmail: string;
  claimPhone: string;
  claimRequestedAt: string;
  claimApprovedAt: string;
  claimApprovedBy: string;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/claims?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setClaims(data.claims || []);
    } catch (err) {
      setError('Failed to load claims');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/claims/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', adminName: 'Admin' }),
      });
      
      if (!response.ok) throw new Error('Failed to approve claim');
      
      // Refresh the list
      fetchClaims();
    } catch (err) {
      setError('Failed to approve claim');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/claims/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', adminName: 'Admin' }),
      });
      
      if (!response.ok) throw new Error('Failed to reject claim');
      
      fetchClaims();
    } catch (err) {
      setError('Failed to reject claim');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Claims Dashboard</h1>
            <a href="/" className="text-primary hover:text-primary-dark">← Back to Site</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-sm underline">Dismiss</button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'verified', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto"></div>
            </div>
          ) : claims.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No claims found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claimed By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{claim.name}</div>
                        <div className="text-sm text-gray-500">{claim.category}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{claim.city}</div>
                        <div className="text-sm text-gray-500">{claim.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{claim.claimedBy}</div>
                        <div className="text-sm text-gray-500">{claim.claimEmail}</div>
                        {claim.claimPhone && (
                          <div className="text-sm text-gray-500">{claim.claimPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(claim.claimStatus)}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {claim.claimRequestedAt && new Date(claim.claimRequestedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {claim.claimStatus === 'verified' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(claim.id)}
                              disabled={processingId === claim.id}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {processingId === claim.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(claim.id)}
                              disabled={processingId === claim.id}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {processingId === claim.id ? '...' : 'Reject'}
                            </button>
                          </div>
                        )}
                        {claim.claimStatus === 'approved' && claim.claimApprovedBy && (
                          <div className="text-sm text-gray-500">
                            By {claim.claimApprovedBy}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
