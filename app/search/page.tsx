'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ProfessionalCard from '@/components/ProfessionalCard';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

// Mock data for professionals
const mockProfessionals = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    category: 'Healthcare',
    city: 'Madrid',
    description: 'English-speaking GP with 15 years experience. Specializes in expat healthcare needs.',
    rating: 4.8,
    reviewCount: 42,
    isVerified: true,
  },
  {
    id: '2',
    name: 'James Wilson',
    category: 'Legal',
    city: 'Barcelona',
    description: 'Immigration lawyer helping expats with visas, residency, and legal matters.',
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
  },
  {
    id: '3',
    name: 'Maria Garcia',
    category: 'Healthcare',
    city: 'Valencia',
    description: 'Pediatrician fluent in English. Specialized in child development and vaccinations.',
    rating: 4.7,
    reviewCount: 56,
    isVerified: true,
  },
  {
    id: '4',
    name: 'Robert Smith',
    category: 'Business',
    city: 'Madrid',
    description: 'Tax advisor and accountant specializing in expat tax returns and financial planning.',
    rating: 4.6,
    reviewCount: 29,
    isVerified: false,
  },
  {
    id: '5',
    name: 'Dr. Emily Chen',
    category: 'Healthcare',
    city: 'Barcelona',
    description: 'Dentist with modern clinic. Offers comprehensive dental care in English.',
    rating: 4.9,
    reviewCount: 67,
    isVerified: true,
  },
  {
    id: '6',
    name: 'Michael Brown',
    category: 'Living',
    city: 'Malaga',
    description: 'Real estate agent helping expats find their perfect home in Costa del Sol.',
    rating: 4.5,
    reviewCount: 23,
    isVerified: true,
  },
  {
    id: '7',
    name: 'Laura Martinez',
    category: 'Legal',
    city: 'Madrid',
    description: 'Property lawyer specializing in Spanish real estate transactions for foreigners.',
    rating: 4.8,
    reviewCount: 31,
    isVerified: true,
  },
  {
    id: '8',
    name: 'David Lee',
    category: 'Business',
    city: 'Valencia',
    description: 'Business consultant helping startups and entrepreneurs navigate Spanish bureaucracy.',
    rating: 4.7,
    reviewCount: 19,
    isVerified: false,
  },
  {
    id: '9',
    name: 'Dr. Anna Schmidt',
    category: 'Healthcare',
    city: 'Barcelona',
    description: 'Orthopedic surgeon with international experience. Fluent in English and German.',
    rating: 4.9,
    reviewCount: 45,
    isVerified: true,
  },
  {
    id: '10',
    name: 'Thomas Wright',
    category: 'Living',
    city: 'Madrid',
    description: 'Relocation expert helping families move to Spain smoothly.',
    rating: 4.6,
    reviewCount: 34,
    isVerified: true,
  },
  {
    id: '11',
    name: 'Sophie Dubois',
    category: 'Legal',
    city: 'Valencia',
    description: 'Family lawyer handling divorces, custody, and inheritance cases for expats.',
    rating: 4.8,
    reviewCount: 27,
    isVerified: true,
  },
  {
    id: '12',
    name: 'Carlos Ruiz',
    category: 'Business',
    city: 'Barcelona',
    description: 'Insurance broker specializing in expat health and property insurance.',
    rating: 4.4,
    reviewCount: 41,
    isVerified: false,
  },
];

const categories = ['All', 'Healthcare', 'Legal', 'Living', 'Business'];
const cities = ['All', 'Madrid', 'Barcelona', 'Valencia', 'Malaga'];

const ITEMS_PER_PAGE = 6;

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCity = searchParams.get('city') || '';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState(initialCity || 'All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter professionals
  const filteredProfessionals = mockProfessionals.filter((pro) => {
    const matchesQuery = initialQuery
      ? pro.name.toLowerCase().includes(initialQuery.toLowerCase()) ||
        pro.description.toLowerCase().includes(initialQuery.toLowerCase()) ||
        pro.category.toLowerCase().includes(initialQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory === 'All' || pro.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || pro.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesQuery && matchesCategory && matchesCity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProfessionals = filteredProfessionals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedCity, initialQuery]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="w-4 h-4 text-spain-red focus:ring-spain-red"
              />
              <span className={`${selectedCategory === category ? 'text-spain-red font-medium' : 'text-gray-600'}`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">City</h3>
        <div className="space-y-2">
          {cities.map((city) => (
            <label key={city} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="city"
                checked={selectedCity === city}
                onChange={() => setSelectedCity(city)}
                className="w-4 h-4 text-spain-red focus:ring-spain-red"
              />
              <span className={`${selectedCity === city ? 'text-spain-red font-medium' : 'text-gray-600'}`}>
                {city}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Professionals</h1>
          <SearchBar variant="compact" initialQuery={initialQuery} initialCity={initialCity} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white border rounded-lg"
        >
          <Filter size={18} />
          <span>Filters</span>
          {isMobileFiltersOpen ? <X size={18} /> : null}
        </button>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`${
              isMobileFiltersOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-xl shadow-sm lg:shadow-none lg:bg-transparent lg:p-0`}
          >
            <div className="lg:hidden mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
            </div>
            <FilterSidebar />
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {paginatedProfessionals.length} of {filteredProfessionals.length} professionals
                {initialQuery && ` for "${initialQuery}"`}
              </p>
            </div>

            {/* Results Grid */}
            {paginatedProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedProfessionals.map((pro) => (
                  <ProfessionalCard key={pro.id} {...pro} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">No professionals found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedCity('All');
                  }}
                  className="mt-4 text-spain-red hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      currentPage === page
                        ? 'bg-spain-red text-white'
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
