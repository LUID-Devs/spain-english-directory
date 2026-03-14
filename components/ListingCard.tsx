import Link from 'next/link';
import ClaimButton from '@/components/claims/ClaimButton';

interface ListingCardProps {
  listing: {
    id: number;
    name: string;
    category: string;
    city: string;
    address?: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    description?: string | null;
    specialties?: string[] | null;
    languages?: string[] | null;
    rating?: number;
    reviewCount?: number;
    isClaimed?: boolean;
  };
  compact?: boolean;
}

export default function ListingCard({ listing, compact = false }: ListingCardProps) {
  const rating = listing.rating ?? 4.7;
  const reviewCount = listing.reviewCount ?? 0;
  const languages = listing.languages && listing.languages.length > 0 ? listing.languages : ['English'];
  const specialties = listing.specialties ?? [];
  const description = listing.description?.trim() || 'No description available.';

  // Generate LocalBusiness schema for this listing
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: (listing.address || '').split(',')[0] || undefined,
      addressLocality: listing.city,
      addressCountry: 'ES',
    },
    ...(listing.phone ? { telephone: listing.phone } : {}),
    ...(listing.email ? { email: listing.email } : {}),
    ...(listing.website ? { url: listing.website } : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount,
    },
    areaServed: listing.city,
    availableLanguage: languages,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{listing.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{listing.category} • {listing.city}</p>
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 ml-1">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {languages.slice(0, 2).map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        <p className={`text-gray-600 text-sm leading-6 mb-4 ${compact ? 'line-clamp-4 min-h-[6rem]' : 'line-clamp-3 min-h-[4.5rem]'}`}>
          {description}
        </p>

        <div className="mb-4 min-h-[2rem]">
          <div className="flex flex-wrap gap-2">
            {specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {specialty}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                +{specialties.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className={`space-y-2 text-sm text-gray-600 ${compact ? 'min-h-[5.5rem]' : ''}`}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{listing.address || `${listing.city}, Spain`}</span>
          </div>

          {listing.phone && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${listing.phone}`} className="hover:text-blue-600">{listing.phone}</a>
            </div>
          )}

          {listing.website && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a 
                href={listing.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-600 truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <Link
            href={`/listing/${listing.id}`}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View Profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <ClaimButton listingId={listing.id} listingName={listing.name} isClaimed={Boolean(listing.isClaimed)} variant="link" />
        </div>
      </article>
    </>
  );
}
