import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Category, City, DirectoryEntry } from '@/models';
import ClaimButton from '@/components/claims/ClaimButton';

interface PageProps {
  params: Promise<{ city: string; category: string }>;
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
  const { city: citySlug, category: categorySlug } = await params;
  const cityName = formatTitle(citySlug);
  const categoryName = formatCategoryName(categorySlug);
  
  const title = `English-Speaking ${categoryName} in ${cityName} | Spain English Directory`;
  const description = `Find English-speaking ${categoryName.toLowerCase()} in ${cityName}, Spain. Browse verified professionals, read reviews, and connect with service providers who speak your language.`;
  
  return {
    title,
    description,
    keywords: [
      `English speaking ${categorySlug} ${citySlug}`,
      `${categoryName} ${cityName} Spain`,
      `English ${categorySlug} ${cityName}`,
      'Spain English Directory',
      `expat ${categorySlug} ${cityName}`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Spain English Directory',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://spainenglishdirectory.com/${citySlug}/${categorySlug}`,
    },
  };
}

// Generate static params for all city+category combinations
export async function generateStaticParams() {
  try {
    const [cities, categories] = await Promise.all([
      City.findAll({ attributes: ['slug'] }),
      Category.findAll({ attributes: ['slug'] }),
    ]);
    
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
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Fetch entries for city+category combination
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

export default async function CityCategoryPage({ params }: PageProps) {
  const { city: citySlug, category: categorySlug } = await params;
  
  // Validate city and category exist
  const { city, category } = await validateParams(citySlug, categorySlug);
  
  if (!city || !category) {
    notFound();
  }
  
  const entries = await getEntries(citySlug, categorySlug);
  const cityName = city.name;
  const categoryName = formatCategoryName(categorySlug);
  
  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href={`/${citySlug}`} className="hover:text-blue-600 transition">
                {cityName}
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li aria-current="page" className="text-gray-900 dark:text-gray-100 font-medium">
              {category.name}
            </li>
          </ol>
        </nav>
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            English-Speaking {categoryName} in {cityName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl">
            Find trusted English-speaking {categoryName.toLowerCase()} in {cityName}. 
            Browse {entries.length} verified professionals ready to help you in your language.
          </p>
        </header>
        
        {/* Entries Grid */}
        {entries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <article 
                key={entry.id}
                className="border rounded-lg p-6 hover:shadow-lg transition bg-white dark:bg-gray-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-lg">{entry.name}</h2>
                    <p className="text-sm text-gray-500">
                      {category.name} • {cityName}
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {entry.description}
                  </p>
                )}
                
                {(entry.phone || entry.email || entry.website) && (
                  <div className="text-sm text-gray-500 mb-4 space-y-1">
                    {entry.phone && (
                      <p>
                        <span className="font-medium">Phone:</span>{' '}
                        <a href={`tel:${entry.phone}`} className="text-blue-600 hover:underline">
                          {entry.phone}
                        </a>
                      </p>
                    )}
                    {entry.email && (
                      <p>
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
              href={`/${citySlug}`}
              className="text-blue-600 hover:underline"
            >
              All services in {cityName} →
            </Link>
            <Link 
              href={`/categories/${categorySlug}`}
              className="text-blue-600 hover:underline"
            >
              {categoryName} in all cities →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
