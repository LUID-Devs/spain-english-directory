'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, BadgeCheck } from 'lucide-react';
import ClaimButton from '../components/ClaimButton';

interface DirectoryEntry {
  id: number;
  name: string;
  category: string;
  description?: string;
  address?: string;
  city: string;
  province?: string;
  phone?: string;
  email?: string;
  website?: string;
  speaksEnglish: boolean;
  isVerified: boolean;
  claimedBy?: number | null;
  claimedAt?: Date | null;
  createdAt: Date;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [category, city]);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/directory-entries');
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load entries');
        return;
      }

      let filtered = data.entries;
      
      if (category) {
        filtered = filtered.filter((e: DirectoryEntry) => 
          e.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      if (city) {
        filtered = filtered.filter((e: DirectoryEntry) => 
          e.city.toLowerCase() === city.toLowerCase()
        );
      }

      setEntries(filtered);
    } catch {
      setError('Failed to load directory entries');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (category && city) return `${category} in ${city}`;
    if (category) return category;
    if (city) return `Professionals in ${city}`;
    return 'All Professionals';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 capitalize">{getTitle()}</h1>
          <p className="text-gray-600 mt-2">
            {entries.length} professional{entries.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No professionals found matching your criteria.</p>
            <Link href="/" className="text-spain-red hover:underline mt-2 inline-block">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spain-red to-red-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {entry.name}
                        </h3>
                        {entry.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-spain-red font-medium">{entry.category}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} />
                        <span>{entry.city}</span>
                        {entry.province && <span>, {entry.province}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {entry.description && (
                    <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                      {entry.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="mt-4 space-y-1 text-sm text-gray-500">
                    {entry.phone && <p>📞 {entry.phone}</p>}
                    {entry.email && <p>✉️ {entry.email}</p>}
                    {entry.website && (
                      <a 
                        href={entry.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-spain-red hover:underline block"
                      >
                        🌐 Website
                      </a>
                    )}
                  </div>

                  {/* Claim Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ClaimButton 
                      directoryEntryId={entry.id} 
                      isClaimed={entry.isVerified || !!entry.claimedBy} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
