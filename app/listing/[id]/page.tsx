'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClaimButton from '@/components/claims/ClaimButton';

interface ListingDetail {
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
  specialties?: string[];
  isClaimed: boolean;
}

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = parseInt(params.id as string, 10);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/directory-entries/${listingId}`);
        const data = await response.json();

        if (!response.ok || !data.success || !data.entry) {
          setError(data.error || 'Listing not found');
          return;
        }

        setListing(data.entry);
      } catch {
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(listingId)) {
      fetchListing();
    }
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
            <p className="text-gray-600">The listing you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/search?city=${listing.city}`} className="hover:text-primary">{listing.city}</Link>
            <span className="mx-2">/</span>
            <Link href={`/search?category=${listing.category}`} className="hover:text-primary">{listing.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{listing.name}</span>
          </nav>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.name}</h1>
                    {listing.isClaimed && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{listing.category} in {listing.city}</p>
                </div>

                <ClaimButton
                  listingId={listingId}
                  listingName={listing.name}
                  isClaimed={listing.isClaimed}
                />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-600 leading-relaxed">{listing.description || 'No description available.'}</p>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {(listing.specialties && listing.specialties.length > 0 ? listing.specialties : ['General Services']).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Languages</h2>
                    <div className="flex flex-wrap gap-2">
                      {['English'].map((language) => (
                        <span
                          key={language}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>

                  <div className="space-y-3">
                    {listing.address && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{listing.address}</span>
                      </div>
                    )}

                    {listing.phone && (
                      <a
                        href={`tel:${listing.phone}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {listing.phone}
                      </a>
                    )}

                    {listing.email && (
                      <a
                        href={`mailto:${listing.email}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {listing.email}
                      </a>
                    )}

                    {listing.website && (
                      <a
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
