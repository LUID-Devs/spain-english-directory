import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { cities, getCityBySlug } from '@/lib/data/cities';
import { categories, getCategoryBySlug } from '@/lib/data/categories';
import { getCityCategoryListings } from '@/lib/server/cityCategoryListings';
import ClientPage from './ClientPage';

interface PageProps {
  params: Promise<{ city: string; category: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  
  const city = getCityBySlug(citySlug);
  const category = getCategoryBySlug(categorySlug);
  
  if (!city || !category) {
    return {
      title: 'Not Found | Spain English Directory',
    };
  }
  
  const data = await getCityCategoryListings({
    citySlug,
    categorySlug,
    page: 1,
    limit: 1,
  });
  const entryCount = data.total;
  
  const title = `English Speaking ${category.name} in ${city.name} | Spain Directory`;
  const description = entryCount > 0
    ? `Find ${entryCount} English-speaking ${category.name.toLowerCase()} in ${city.name}, Spain. Browse verified professionals, read reviews, and connect with service providers who speak your language.`
    : `Find English-speaking ${category.name.toLowerCase()} in ${city.name}, Spain. Browse verified professionals, read reviews, and connect with service providers who speak your language.`;
  
  return {
    title,
    description,
    keywords: [
      `English speaking ${categorySlug} ${citySlug}`,
      `${category.name} ${city.name} Spain`,
      `English ${categorySlug} ${city.name}`,
      'Spain English Directory',
      `expat ${categorySlug} ${citySlug}`,
      `${category.name} for foreigners ${city.name}`,
      `${category.singular} ${city.name} English`,
      `${category.name} ${city.name} reviews`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Spain English Directory',
      url: `https://spainenglishdirectory.com/${citySlug}/${categorySlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://spainenglishdirectory.com/${citySlug}/${categorySlug}`,
    },
    robots: entryCount === 0 ? {
      index: false,
      follow: true,
    } : {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for all city+category combinations
export async function generateStaticParams() {
  const params: { city: string; category: string }[] = [];
  
  for (const city of cities) {
    for (const category of categories) {
      params.push({
        city: city.slug,
        category: category.slug,
      });
    }
  }
  
  return params;
}

// Generate JSON-LD structured data
function generateStructuredData(
  categorySlug: string,
  categoryName: string,
  citySlug: string,
  cityName: string,
  listings: { id: number; name: string }[],
  baseUrl: string
): unknown[] {
  const categoryUrl = `${baseUrl}/categories/${categorySlug}`;
  const cityUrl = `${baseUrl}/${citySlug}`;
  const currentUrl = `${baseUrl}/${citySlug}/${categorySlug}`;
  
  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: cityUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: currentUrl,
      },
    ],
  };
  
  // WebPage schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': currentUrl,
    url: currentUrl,
    name: `English Speaking ${categoryName} in ${cityName} | Spain English Directory`,
    description: `Find English-speaking ${categoryName.toLowerCase()} in ${cityName}, Spain.`,
    breadcrumb: {
      '@id': `${currentUrl}#breadcrumb`,
    },
  };
  
  // LocalBusiness schema for each listing
  const localBusinessSchemas = listings.map((listing) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/professionals/${listing.id}`,
    name: listing.name,
    url: `${baseUrl}/professionals/${listing.id}`,
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    serviceType: categoryName,
    inLanguage: ['English', 'Spanish'],
  }));
  
  // ItemList schema for the listings
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} in ${cityName}`,
    itemListElement: listings.map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/professionals/${listing.id}`,
        name: listing.name,
        url: `${baseUrl}/professionals/${listing.id}`,
        areaServed: {
          '@type': 'City',
          name: cityName,
        },
      },
    })),
  };
  
  return [breadcrumbSchema, webPageSchema, itemListSchema, ...localBusinessSchemas];
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// Generate FAQs for the page
function generateFAQs(cityName: string, categoryName: string, categorySingular: string) {
  return [
    {
      question: `Why should I choose an English-speaking ${categorySingular.toLowerCase()} in ${cityName}?`,
      answer: `Choosing an English-speaking ${categorySingular.toLowerCase()} in ${cityName} ensures clear communication about your needs, especially important for complex matters. It eliminates language barriers and helps you fully understand services, procedures, and recommendations.`
    },
    {
      question: `How do I book an appointment with a ${categorySingular.toLowerCase()} in ${cityName}?`,
      answer: `Most ${categoryName.toLowerCase()} listed in our directory offer online booking, phone appointments, or email contact. Many also accept walk-ins during business hours. Check individual listings for specific booking methods.`
    },
    {
      question: `Are the ${categoryName.toLowerCase()} in ${cityName} verified?`,
      answer: `Yes, all ${categoryName.toLowerCase()} in our ${cityName} directory are verified for their professional credentials and English language proficiency. We regularly update our listings to ensure accuracy.`
    },
    {
      question: `What areas of ${cityName} do these ${categoryName.toLowerCase()} serve?`,
      answer: `Our listed ${categoryName.toLowerCase()} serve clients throughout ${cityName} and surrounding areas. Many also offer virtual consultations for added convenience.`
    },
  ];
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { city: citySlug, category: categorySlug } = await params;
  
  // Validate city and category
  const city = getCityBySlug(citySlug);
  const category = getCategoryBySlug(categorySlug);
  
  if (!city || !category) {
    notFound();
  }
  
  // Get initial listings data
  const initialData = await getCityCategoryListings({
    citySlug,
    categorySlug,
    page: 1,
    limit: 20,
  });
  
  // Generate content
  const content = {
    title: `English Speaking ${category.name} in ${city.name}`,
    intro: `Find trusted English-speaking ${category.name.toLowerCase()} in ${city.name}. Browse ${initialData.total} verified ${initialData.total === 1 ? 'professional' : 'professionals'} ready to help you in your language. Whether you're an expat, digital nomad, or tourist, connect with ${category.name.toLowerCase()} who understand your needs.`,
  };
  
  // Generate FAQs
  const faqs = generateFAQs(city.name, category.name, category.singular);
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: city.name, href: `/${citySlug}` },
    { label: category.name },
  ];
  
  // Generate structured data
  const baseUrl = 'https://spainenglishdirectory.com';
  const structuredData = generateStructuredData(
    categorySlug,
    category.name,
    citySlug,
    city.name,
    initialData.listings.map(l => ({ id: l.id, name: l.name })),
    baseUrl
  );
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
        <ClientPage
          initialData={initialData}
          citySlug={citySlug}
          categorySlug={categorySlug}
          content={content}
          city={city}
          category={category}
          faqs={faqs}
          breadcrumbItems={breadcrumbItems}
        />
      </Suspense>
    </>
  );
}
