'use client';

import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ProfessionalCard from "@/components/ProfessionalCard";
import SearchFilterSidebar from "@/components/SearchFilterSidebar";
import Link from "next/link";

// Sample data for demonstration
const sampleProfessionals = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    category: "Healthcare",
    description: "British GP with 15 years experience. Specializes in family medicine and expat healthcare needs.",
    city: "Madrid",
    phone: "+34 912 345 678",
    email: "dr.mitchell@example.com",
    website: "https://example.com",
  },
  {
    id: 2,
    name: "James Wilson Legal",
    category: "Legal",
    description: "English-speaking solicitor specializing in property law, residency visas, and business setup.",
    city: "Barcelona",
    phone: "+34 933 456 789",
    email: "info@jwlegal.es",
  },
  {
    id: 3,
    name: "Costa Brava Properties",
    category: "Living",
    description: "Real estate agency helping expats find their dream home on the Costa Brava.",
    city: "Barcelona",
    phone: "+34 972 123 456",
    website: "https://example.com",
  },
  {
    id: 4,
    name: "TaxAssist Spain",
    category: "Business",
    description: "English-speaking accountants and tax advisors for freelancers and small businesses.",
    city: "Valencia",
    phone: "+34 963 789 012",
    email: "hello@taxassist.es",
  },
  {
    id: 5,
    name: "Málaga Dental Clinic",
    category: "Healthcare",
    description: "Modern dental clinic with English-speaking staff. Emergency appointments available.",
    city: "Málaga",
    phone: "+34 951 234 567",
    website: "https://example.com",
  },
  {
    id: 6,
    name: "Barcelona Family Law",
    category: "Legal",
    description: "Family law specialists handling divorce, custody, and inheritance cases for expats.",
    city: "Barcelona",
    phone: "+34 934 567 890",
    email: "contact@bflaw.es",
  },
];

const categories = ["Healthcare", "Legal", "Living", "Business"];
const cities = ["Madrid", "Barcelona", "Valencia", "Málaga", "Seville", "Bilbao"];

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Filter professionals based on search params
  let filteredProfessionals = sampleProfessionals;

  if (query) {
    const q = query.toLowerCase();
    filteredProfessionals = filteredProfessionals.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (category) {
    filteredProfessionals = filteredProfessionals.filter(
      (p) => p.category === category
    );
  }

  if (city) {
    filteredProfessionals = filteredProfessionals.filter((p) => p.city === city);
  }

  const itemsPerPage = 6;
  const totalResults = filteredProfessionals.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedResults = filteredProfessionals.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const hasFilters = query || category || city;

  return (
    <>
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4">
            <SearchBar initialQuery={query} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">{totalResults} results found</span>
            {hasFilters && (
              <>
                {query && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    Search: {query}
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {category}
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {city}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <SearchFilterSidebar categories={categories} cities={cities} />

          {/* Results Grid */}
          <div className="flex-1">
            {paginatedResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedResults.map((professional) => (
                    <ProfessionalCard key={professional.id} {...professional} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={`/search?${new URLSearchParams({
                          ...(query && { q: query }),
                          ...(category && { category }),
                          ...(city && { city }),
                          page: String(page - 1),
                        }).toString()}`}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </Link>
                    )}
                    <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/search?${new URLSearchParams({
                          ...(query && { q: query }),
                          ...(category && { category }),
                          ...(city && { city }),
                          page: String(page + 1),
                        }).toString()}`}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
