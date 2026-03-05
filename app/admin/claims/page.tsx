'use client';

import { useEffect, useState } from 'react';

type ClaimStatus = 'pending' | 'verified' | 'approved' | 'rejected';
type StatusFilter = 'all' | ClaimStatus;

interface ClaimRecord {
  id: number;
  name: string;
  email: string;
  status: ClaimStatus;
  directoryEntry?: {
    id: number;
    name: string;
    category: string;
    city: string;
  };
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClaims = async (status: StatusFilter): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/claims?status=${status}`);
      const data = (await response.json()) as {
        success: boolean;
        claims?: ClaimRecord[];
        error?: string;
      };

      if (!response.ok || !data.success || !data.claims) {
        setError(data.error ?? 'Unable to load claims.');
        return;
      }

      setClaims(data.claims);
    } catch {
      setError('Unable to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClaims(filter);
  }, [filter]);

  const handleAction = async (id: number, action: 'approve' | 'reject'): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/claims/${id}/${action}`, {
        method: 'POST',
      });

      const data = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? `Unable to ${action} claim.`);
        return;
      }

      await loadClaims(filter);
    } catch {
      setError(`Unable to ${action} claim.`);
    }
  };

  const tabs: StatusFilter[] = ['all', 'pending', 'verified', 'approved', 'rejected'];

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-3xl font-bold">Claims Dashboard</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded px-3 py-1 text-sm ${
              filter === tab ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p>Loading claims...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-left text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2">Name</th>
                <th className="border border-gray-200 px-3 py-2">Email</th>
                <th className="border border-gray-200 px-3 py-2">Business</th>
                <th className="border border-gray-200 px-3 py-2">Status</th>
                <th className="border border-gray-200 px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td className="border border-gray-200 px-3 py-2">{claim.name}</td>
                  <td className="border border-gray-200 px-3 py-2">{claim.email}</td>
                  <td className="border border-gray-200 px-3 py-2">
                    {claim.directoryEntry ? claim.directoryEntry.name : 'Unknown'}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">{claim.status}</td>
                  <td className="border border-gray-200 px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(claim.id, 'approve')}
                        disabled={claim.status !== 'verified'}
                        className="rounded bg-green-600 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(claim.id, 'reject')}
                        disabled={claim.status === 'approved' || claim.status === 'rejected'}
                        className="rounded bg-red-600 px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
