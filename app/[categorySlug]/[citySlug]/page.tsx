import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Category, City, DirectoryEntry } from '@/models';
import ClaimButton from '@/components/claims/ClaimButton';

interface PageProps {
  params: Promise<{ citySlug: string; categorySlug: string }>;
}

// Format helpers
function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCategoryName(slug: string): string {
  const formatted = formatTitle(slug);
  // Common pluralizations for categories
  if (['dental', 'legal', 'medical', 'healthcare'].includes(slug.toLowerCase())) {
    return formatted + ' Services';
  }
  return formatted;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { citySlug, categorySlug } = await params;
  const cityName = formatTitle(citySlug);
  const categoryName = formatCategoryName(categorySlug);
  
  // Fetch entries count for the description
  const entryCount = await getEntryCount(citySlug, categorySlug);
  
  const title = `${categoryName} in ${cityName} | Spain English Directory`;
  const description = entryCount > 0
    ? `Find ${entryCount} English-speaking ${categoryName.toLowerCase()} in ${cityName}, Spain. Browse verified professionals, read reviews, and connect with service providers who speak your language.`
    : `Find English-speaking ${categoryName.toLowerCase()} in ${cityName}, Spain. Browse verified professionals, read reviews, and connect with service providers who speak your language.`;
  
  return {
    title,
    description,
    keywords: [
      `English speaking ${categorySlug} ${citySlug}`,
      `${categoryName} ${cityName} Spain`,
      `English ${categorySlug} ${cityName}`,
      'Spain English Directory',
      `expat ${categorySlug} ${citySlug}`,
      `${categoryName} for foreigners ${cityName}`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Spain English Directory',
      url: `https://spainenglishdirectory.com/${categorySlug}/${citySlug}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://spainenglishdirectory.com/${categorySlug}/${citySlug}`,
    },
    // Add noindex for empty result pages
    robots: entryCount === 0 ? {
      index: false,
      follow: true,
    } : {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for all category+city combinations
export async function generateStaticParams() {
  try {
    const [cities, categories] = await Promise.all([
      City.findAll({ attributes: ['slug'] }),
      Category.findAll({ attributes: ['slug'] }),
    ]);
    
    const params: { citySlug: string; categorySlug: string }[] = [];
    
    for (const category of categories) {
      for (const city of cities) {
        params.push({
          citySlug: city.slug,
          categorySlug: category.slug,
        });
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Fetch entries count for metadata
async function getEntryCount(citySlug: string, categorySlug: string): Promise<number> {
  try {
    const count = await DirectoryEntry.count({
      where: {
        city: citySlug,
        category: categorySlug,
      },
    });
    return count;
  } catch (error) {
    console.error('Error fetching entry count:', error);
    return 0;
  }
}

// Fetch entries for category+city combination
async function getEntries(citySlug: string, categorySlug: string) {
  try {
    const entries = await DirectoryEntry.findAll({
      where: {
        city: citySlug,
        category: categorySlug,
      },
      order: [
        ['isFeatured', 'DESC'],
        ['isVerified', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    return entries;
  } catch (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
}

// Validate that city and category exist
async function validateParams(citySlug: string, categorySlug: string) {
  try {
    const [city, category] = await Promise.all([
      City.findOne({ where: { slug: citySlug.toLowerCase() } }),
      Category.findOne({ where: { slug: categorySlug.toLowerCase() } }),
    ]);
    return { city, category };
  } catch (error) {
    console.error('Error validating params:', error);
    return { city: null, category: null };
  }
}

// Generate JSON-LD structured data
function generateStructuredData(
  categorySlug: string,
  categoryName: string,
  citySlug: string,
  cityName: string,
  entries: { id: number; name: string }[],
  baseUrl: string
): unknown[] {
  const categoryUrl = `${baseUrl}/categories/${categorySlug}`;
  const currentUrl = `${baseUrl}/${categorySlug}/${citySlug}`;
  
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
        name: categoryName,
        item: categoryUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${categoryName} in ${cityName}`,
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
    name: `${categoryName} in ${cityName} | Spain English Directory`,
    description: `Find English-speaking ${categoryName.toLowerCase()} in ${cityName}, Spain.`,
    breadcrumb: {
      '@id': `${currentUrl}#breadcrumb`,
    },
  };
  
  const schemas: unknown[] = [breadcrumbSchema, webPageSchema];
  
  // ItemList schema for the entries (only if entries exist)
  if (entries.length > 0) {
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${categoryName} in ${cityName}`,
      itemListElement: entries.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          '@id': `${baseUrl}/professionals/${entry.id}`,
          name: entry.name,
          url: `${baseUrl}/professionals/${entry.id}`,
          areaServed: {
            '@type': 'City',
            name: cityName,
          },
        },
      })),
    };
    schemas.push(itemListSchema);
  }
  
  return schemas;
}

export default async function CategoryCityPage({ params }: PageProps) {
  const { citySlug, categorySlug } = await params;
  
  // Validate city and category exist
  const { city, category } = await validateParams(citySlug, categorySlug);
  
  if (!city || !category) {
    notFound();
  }
  
  const entries = await getEntries(citySlug, categorySlug);
  const cityName = city.name;
  const categoryName = formatCategoryName(categorySlug);
  const baseUrl = 'https://spainenglishdirectory.com';
  
  // Generate structured data
  const structuredData = generateStructuredData(
    categorySlug,
    category.name,
    citySlug,
    cityName,
    entries.map(e => ({ id: e.id, name: e.name })),
    baseUrl
  );
  
  return (
    <div className="min-h-screen p-8 pb-20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-blue-600 transition" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href={`/categories/${categorySlug}`} className="hover:text-blue-600 transition" itemProp="item">
                <span itemProp="name">{category.name}</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page">
              <span className="text-gray-900 dark:text-gray-100 font-medium" itemProp="name">
                {cityName}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {categoryName} in {cityName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl">
            Find trusted English-speaking {categoryName.toLowerCase()} in {cityName}. 
            Browse {entries.length} verified {entries.length === 1 ? 'professional' : 'professionals'} ready to help you in your language.
          </p>
        </header>
        
        {/* Entries Grid */}
        {entries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" itemScope itemType="https://schema.org/ItemList">
            <meta itemProp="name" content={`${categoryName} in ${cityName}`} />
            {entries.map((entry, index) => (
              <article 
                key={entry.id}
                className="border rounded-lg p-6 hover:shadow-lg transition bg-white dark:bg-gray-900"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <meta itemProp="position" content={String(index + 1)} />
                <div itemProp="item" itemScope itemType="https://schema.org/LocalBusiness">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-lg" itemProp="name">{entry.name}</h2>
                      <p className="text-sm text-gray-500">
                        <span itemProp="additionalType">{category.name}</span> • <span itemProp="areaServed">{cityName}</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {entry.isVerified && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                      {entry.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                      {entry.isClaimed ? (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                          Claimed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Unclaimed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {entry.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3" itemProp="description">
                      {entry.description}
                    </p>
                  )}
                  
                  {(entry.phone || entry.email || entry.website) && (
                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                      {entry.phone && (
                        <p itemProp="telephone">
                          <span className="font-medium">Phone:</span>{' '}
                          <a href={`tel:${entry.phone}`} className="text-blue-600 hover:underline">
                            {entry.phone}
                          </a>
                        </p>
                      )}
                      {entry.email && (
                        <p itemProp="email">
                          <span className="font-medium">Email:</span>{' '}
                          <a href={`mailto:${entry.email}`} className="text-blue-600 hover:underline">
                            {entry.email}
                          </a>
                        </p>
                      )}
                      {entry.website && (
                        <p>
                          <span className="font-medium">Website:</span>{' '}
                          <a 
                            href={entry.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            itemProp="url"
                          >
                            Visit Website
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <ClaimButton
                      listingId={entry.id}
                      listingName={entry.name}
                      isClaimed={entry.isClaimed}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No providers found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We don&apos;t have any {categoryName.toLowerCase()} listed in {cityName} yet.
            </p>
            <p className="text-sm text-gray-500">
              Check back soon or browse other categories in {cityName}.
            </p>
          </div>
        )}
        
        {/* Related Links */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Explore More</h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              href={`/categories/${categorySlug}`}
              className="text-blue-600 hover:underline"
            >
              {categoryName} in all cities →
            </Link>
            <Link 
              href={`/${citySlug}`}
              className="text-blue-600 hover:underline"
            >
              All services in {cityName} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
