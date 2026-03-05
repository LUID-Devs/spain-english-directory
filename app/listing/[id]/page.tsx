'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClaimButton from '@/components/ClaimButton';
import ClaimModal from '@/components/ClaimModal';
import { DirectoryListing } from '@/lib/data/listing-types';

interface ListingWithClaim extends DirectoryListing {
  claimStatus?: string;
  claimedBy?: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = parseInt(params.id as string, 10);
  
  const [listing, setListing] = useState<ListingWithClaim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Fetch from API
        const response = await fetch(`/api/professionals/${listingId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const data = result.data;
            // Map API response to DirectoryListing format
            setListing({
              id: data.id,
              name: data.name,
              category: data.category?.name || data.category,
              city: data.city?.name || data.city,
              address: data.address || '',
              phone: data.phone || '',
              email: data.email || '',
              website: data.website,
              description: data.description || '',
              specialties: data.category?.specialties?.slice(0, 3) || [],
              languages: data.speaksEnglish ? ['English', 'Spanish'] : ['Spanish'],
              rating: 0, // Would need to calculate from reviews
              reviewCount: 0,
              isVerified: data.isVerified,
              isFeatured: data.isFeatured,
              claimStatus: data.claimStatus,
              claimedBy: data.claimedBy,
            });
          } else {
            setError('Listing not found');
          }
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(listingId)) {
      fetchListing();
    }
  }, [listingId]);

  const handleClaimSuccess = () => {
    // Refresh listing data to show updated claim status
    setListing(prev => prev ? { ...prev, claimStatus: 'verified' } : null);
  };

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
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500">
            <a href="/" className="hover:text-primary">Home</a>
            <span className="mx-2">/</span>
            <a href={`/search?city=${listing.city}`} className="hover:text-primary">{listing.city}</a>
            <span className="mx-2">/</span>
            <a href={`/search?category=${listing.category}`} className="hover:text-primary">{listing.category}</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{listing.name}</span>
          </nav>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.name}</h1>
                    {listing.claimStatus === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{listing.category} in {listing.city}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(listing.rating) ? 'fill-current' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 ml-2">
                      {listing.rating.toFixed(1)} ({listing.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                
                <ClaimButton
                  listingId={listingId}
                  claimStatus={listing.claimStatus || 'unclaimed'}
                  onClaimClick={() => setIsClaimModalOpen(true)}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-600 leading-relaxed">{listing.description}</p>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.specialties.map((specialty) => (
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
                      {listing.languages.map((language) => (
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

                {/* Contact Info */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{listing.address}</span>
                    </div>

                    <a
                      href={`tel:${listing.phone}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {listing.phone}
                    </a>

                    <a
                      href={`mailto:${listing.email}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {listing.email}
                    </a>

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

      <ClaimModal
        listingId={listingId}
        listingName={listing.name}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  );
}
