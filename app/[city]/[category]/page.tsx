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
    openGraph: {
      title: content.title,
      description: `Find trusted English-speaking ${category.name.toLowerCase()} in ${city.name}. Browse verified listings with reviews and contact details.`,
      type: 'website',
    },
  };
}

export default async function CombinationPage({ params }: PageProps) {
  const { city: citySlug, category: categorySlug } = await params;
  
  // Validate params
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

  return (
    <div className="min-h-screen bg-gray-50">
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
