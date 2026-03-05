'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import FilterSidebar from '@/components/FilterSidebar';
import ListingCard from '@/components/ListingCard';
import Pagination from '@/components/Pagination';
import FAQSection from '@/components/FAQSection';
import { DirectoryListing, getListings } from '@/lib/data/listings';

interface ClientPageProps {
  initialData: {
    listings: DirectoryListing[];
    total: number;
    page: number;
    totalPages: number;
    specialty: string | null;
    language: string | null;
  };
  citySlug: string;
  categorySlug: string;
  content: {
    title: string;
    intro: string;
  };
  city: {
    slug: string;
    name: string;
    province: string;
    population: string;
  };
  category: {
    slug: string;
    name: string;
    singular: string;
    specialties: readonly string[];
  };
  faqs: { question: string; answer: string }[];
  breadcrumbItems: { label: string; href?: string }[];
}

export default function ClientPage({
  initialData,
  citySlug,
  categorySlug,
  content,
  city,
  category,
  faqs,
  breadcrumbItems,
}: ClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Get filter values from URL
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSpecialty = searchParams.get('specialty');
  const urlLanguage = searchParams.get('language');
  
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(urlSpecialty);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(urlLanguage);
  const [currentPage, setCurrentPage] = useState(urlPage);
  
  // Get filtered listings based on current filters
  const filteredData = getListings(citySlug, categorySlug, {
    page: currentPage,
    limit: 20,
    specialty: selectedSpecialty || undefined,
    language: selectedLanguage || undefined,
  });
  
  const [listings, setListings] = useState(filteredData.listings);
  const [totalPages, setTotalPages] = useState(filteredData.totalPages);
  const [total, setTotal] = useState(filteredData.total);

  // Update listings when filters change
  useEffect(() => {
    const data = getListings(citySlug, categorySlug, {
      page: currentPage,
      limit: 20,
      specialty: selectedSpecialty || undefined,
      language: selectedLanguage || undefined,
    });
    setListings(data.listings);
    setTotalPages(data.totalPages);
    setTotal(data.total);
  }, [citySlug, categorySlug, currentPage, selectedSpecialty, selectedLanguage]);

  const updateURL = useCallback((
    page: number,
    specialty: string | null,
    language: string | null
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    if (specialty) {
      params.set('specialty', specialty);
    } else {
      params.delete('specialty');
    }
    
    if (language) {
      params.set('language', language);
    } else {
      params.delete('language');
    }
    
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.push(newURL, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  const handleSpecialtyChange = useCallback((specialty: string | null) => {
    setSelectedSpecialty(specialty);
    setCurrentPage(1);
    updateURL(1, specialty, selectedLanguage);
  }, [selectedLanguage, updateURL]);

  const handleLanguageChange = useCallback((language: string | null) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
    updateURL(1, selectedSpecialty, language);
  }, [selectedSpecialty, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(page, selectedSpecialty, selectedLanguage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSpecialty, selectedLanguage, updateURL]);

  return (
    <>
      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl leading-relaxed">
            {content.intro}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <FilterSidebar
            specialties={[...category.specialties]}
            selectedSpecialty={selectedSpecialty}
            onSpecialtyChange={handleSpecialtyChange}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-medium">{listings.length}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </p>
            </div>

            <div className="grid gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          faqs={faqs}
          cityName={city.name}
          categoryName={category.name}
        />
      </div>
    </>
  );
}
