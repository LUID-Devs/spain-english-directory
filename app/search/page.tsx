import Link from 'next/link';
import { Op, QueryTypes, WhereOptions } from 'sequelize';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import ProfessionalCard from '@/components/ProfessionalCard';
import SearchFilterSidebar from '@/components/SearchFilterSidebar';
import { DirectoryEntry, sequelize } from '@/models';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type DirectoryEntryResult = {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  city: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

function toSingle(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const query = toSingle(params.q).trim();
  const category = toSingle(params.category).trim();
  const city = toSingle(params.city).trim();
  const requestedPage = Number.parseInt(toSingle(params.page), 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const where: WhereOptions = {};
  let searchWhere: WhereOptions | null = null;

  if (query) {
    const escapedQuery = query.replace(/[%_\\]/g, '\\$&');
    const searchTerm = `%${escapedQuery}%`;
    searchWhere = {
      [Op.or]: [
      { name: { [Op.iLike]: searchTerm } },
      { description: { [Op.iLike]: searchTerm } },
      { category: { [Op.iLike]: searchTerm } },
      { city: { [Op.iLike]: searchTerm } },
      ],
    };
  }

  if (category) {
    where.category = { [Op.iLike]: category };
  }

  if (city) {
    where.city = { [Op.iLike]: city };
  }

  const finalWhere = searchWhere ? ({ ...where, ...searchWhere } as WhereOptions) : where;

  const itemsPerPage = 18;
  const offset = (currentPage - 1) * itemsPerPage;

  const [totalResults, professionals, categoryRows, cityRows] = await Promise.all([
    DirectoryEntry.count({ where: finalWhere }),
    DirectoryEntry.findAll({
      where: finalWhere,
      limit: itemsPerPage,
      offset,
      order: [
        ['isFeatured', 'DESC'],
        ['isVerified', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      attributes: ['id', 'name', 'category', 'description', 'city', 'phone', 'email', 'website'],
      raw: true,
    }) as Promise<DirectoryEntryResult[]>,
    sequelize.query<{ value: string }>(
      `SELECT DISTINCT category AS value
       FROM directory_entries
       WHERE category IS NOT NULL AND category <> ''
       ORDER BY category ASC`,
      { type: QueryTypes.SELECT }
    ),
    sequelize.query<{ value: string }>(
      `SELECT DISTINCT city AS value
       FROM directory_entries
       WHERE city IS NOT NULL AND city <> ''
       ORDER BY city ASC`,
      { type: QueryTypes.SELECT }
    ),
  ]);

  const categories = categoryRows.map((row) => row.value);
  const cities = cityRows.map((row) => row.value);

  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const page = Math.min(currentPage, totalPages);

  const hasFilters = Boolean(query || category || city);

  const buildPageLink = (targetPage: number): string => {
    const urlParams = new URLSearchParams();
    if (query) urlParams.set('q', query);
    if (category) urlParams.set('category', category);
    if (city) urlParams.set('city', city);
    if (targetPage > 1) urlParams.set('page', String(targetPage));
    const queryString = urlParams.toString();
    return queryString ? `/search?${queryString}` : '/search';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted">
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

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <SearchFilterSidebar categories={categories} cities={cities} />

            <div className="flex-1">
              {professionals.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {professionals.map((professional) => (
                      <ProfessionalCard
                        key={professional.id}
                        id={professional.id}
                        name={professional.name}
                        category={professional.category}
                        description={professional.description ?? undefined}
                        city={professional.city}
                        phone={professional.phone ?? undefined}
                        email={professional.email ?? undefined}
                        website={professional.website ?? undefined}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      {page > 1 && (
                        <Link
                          href={buildPageLink(page - 1)}
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
                          href={buildPageLink(page + 1)}
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
                    <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
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
