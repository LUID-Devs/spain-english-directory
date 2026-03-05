import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ProfessionalCard from "@/components/ProfessionalCard";
import SearchFilterSidebar from "@/components/SearchFilterSidebar";
import Link from "next/link";

export const dynamic = 'force-dynamic';

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

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const city = typeof params.city === "string" ? params.city : "";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted">
        {/* Search Header */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4">
              <SearchBar initialQuery={query} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{totalResults} results found</span>
              {hasFilters && (
                <>
                  {query && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      Search: {query}
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/30 px-2 py-1 text-xs text-accent">
                      {category}
                    </span>
                  )}
                  {city && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/30 px-2 py-1 text-xs text-accent">
                      {city}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          Previous
                        </Link>
                      )}
                      <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
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
                          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-border bg-white p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you&apos;re looking for.
                  </p>
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                  >
                    Clear all filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
