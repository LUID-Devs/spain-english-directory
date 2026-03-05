import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { 
  isValidCity, 
  isValidCategory, 
  getCityBySlug, 
  getCategoryBySlug,
  getIntroContent,
  getFAQs,
  getListings
} from '@/lib/data';
import ClientPage from './ClientPage';

interface PageProps {
  params: Promise<{
    city: string;
    category: string;
  }>;
}

// Base URL for canonical links
const BASE_URL = 'https://spainenglishdirectory.com';

// Generate static params for all city/category combinations
export function generateStaticParams() {
  const cities = ['madrid', 'barcelona', 'valencia', 'seville', 'malaga'];
  const categories = ['doctors', 'lawyers', 'dentists', 'accountants', 'therapists', 'veterinarians', 'realtors', 'mechanics', 'hairdressers', 'fitness-trainers'];
  
  const params: { city: string; category: string }[] = [];
  
  for (const city of cities) {
    for (const category of categories) {
      params.push({ city, category });
    }
  }
  
  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  
  if (!isValidCity(citySlug) || !isValidCategory(categorySlug)) {
    return {
      title: 'Not Found',
    };
  }
  
  const content = getIntroContent(citySlug, categorySlug);
  const category = getCategoryBySlug(categorySlug)!;
  const city = getCityBySlug(citySlug)!;
  const canonicalUrl = `${BASE_URL}/${citySlug}/${categorySlug}`;
  
  return {
    title: `${content.title} | Spain English Directory`,
    description: `Find trusted English-speaking ${category.name.toLowerCase()} in ${city.name}, Spain. Browse verified listings with reviews, contact details, and specialties.`,
    keywords: [
      `english speaking ${category.singular.toLowerCase()} ${city.name.toLowerCase()}`,
      `${category.singular.toLowerCase()} ${city.name.toLowerCase()} english`,
      `english ${category.name.toLowerCase()} ${city.name.toLowerCase()} spain`,
      `find ${category.name.toLowerCase()} ${city.name.toLowerCase()}`,
      `${category.name.toLowerCase()} in ${city.name.toLowerCase()}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: content.title,
      description: `Find trusted English-speaking ${category.name.toLowerCase()} in ${city.name}. Browse verified listings with reviews and contact details.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Spain English Directory',
      url: canonicalUrl,
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${content.title} - Spain English Directory`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: `Find trusted English-speaking ${category.name.toLowerCase()} in ${city.name}. Browse verified listings with reviews and contact details.`,
      images: [`${BASE_URL}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function CombinationPage({ params }: PageProps) {
  const { city: citySlug, category: categorySlug } = await params;
  
  // Validate params - return 404 for invalid city/category combos
  if (!isValidCity(citySlug) || !isValidCategory(categorySlug)) {
    notFound();
  }
  
  const content = getIntroContent(citySlug, categorySlug);
  const category = getCategoryBySlug(categorySlug)!;
  const city = getCityBySlug(citySlug)!;
  const faqs = getFAQs(categorySlug, citySlug);
  
  const { listings, total, page, totalPages } = getListings(citySlug, categorySlug, {
    page: 1,
    limit: 20,
  });
  
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: city.name, href: `/${citySlug}` },
    { label: category.name },
  ];

  // Generate ItemList structured data for the collection of listings
  const itemListStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${content.title}`,
    description: `Directory of English-speaking ${category.name.toLowerCase()} in ${city.name}`,
    url: `${BASE_URL}/${citySlug}/${categorySlug}`,
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: listing.name,
        description: listing.description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: listing.address.split(',')[0],
          addressLocality: listing.city,
          addressCountry: 'ES',
        },
        telephone: listing.phone,
        email: listing.email,
        url: listing.website || `${BASE_URL}/listing/${listing.id}`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: listing.rating.toFixed(1),
          reviewCount: listing.reviewCount,
        },
      },
    })),
  };

  // Generate WebPage structured data
  const webPageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.title,
    description: `Find trusted English-speaking ${category.name.toLowerCase()} in ${city.name}, Spain.`,
    url: `${BASE_URL}/${citySlug}/${categorySlug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.href ? `${BASE_URL}${item.href}` : `${BASE_URL}/${citySlug}/${categorySlug}`,
      })),
    },
    about: {
      '@type': 'Thing',
      name: `${category.name} in ${city.name}`,
      description: `English-speaking ${category.name.toLowerCase()} serving the international community in ${city.name}`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ItemList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListStructuredData) }}
      />
      {/* WebPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
        <ClientPage 
          initialData={{
            listings,
            total,
            page,
            totalPages,
            specialty: null,
            language: null,
          }}
          citySlug={citySlug}
          categorySlug={categorySlug}
          content={content}
          city={city}
          category={category}
          faqs={faqs}
          breadcrumbItems={breadcrumbItems}
        />
      </Suspense>
    </div>
  );
}
