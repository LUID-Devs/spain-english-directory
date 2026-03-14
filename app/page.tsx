import Link from 'next/link';
import {
  BriefcaseBusiness,
  Building2,
  HeartPulse,
  Landmark,
  School,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { DirectoryEntry } from '@/models';
import { CategoryCard, CityCard, ListingCard, SearchBar } from '@/components';

type HomeEntry = {
  id: number;
  name: string;
  category: string;
  city: string;
  province?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  specialties?: string[] | null;
  isClaimed: boolean;
  isFeatured?: boolean;
};

const cityGradients: string[] = [
  'linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #38bdf8 100%)',
  'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 45%, #f59e0b 100%)',
  'linear-gradient(135deg, #064e3b 0%, #059669 45%, #34d399 100%)',
  'linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #c4b5fd 100%)',
  'linear-gradient(135deg, #3f3f46 0%, #0f766e 45%, #5eead4 100%)',
  'linear-gradient(135deg, #1e293b 0%, #334155 45%, #94a3b8 100%)',
];

function categoryIcon(name: string) {
  const value = name.toLowerCase();

  if (value.includes('health') || value.includes('doctor') || value.includes('dent')) {
    return <Stethoscope className="h-5 w-5" />;
  }
  if (value.includes('legal') || value.includes('law')) {
    return <Landmark className="h-5 w-5" />;
  }
  if (value.includes('educat') || value.includes('school')) {
    return <School className="h-5 w-5" />;
  }
  if (value.includes('service')) {
    return <Sparkles className="h-5 w-5" />;
  }
  if (value.includes('business') || value.includes('tax') || value.includes('finance')) {
    return <BriefcaseBusiness className="h-5 w-5" />;
  }
  return <Building2 className="h-5 w-5" />;
}

export default async function Home() {
  let entries: HomeEntry[] = [];
  let loadError = false;

  try {
    const rows = await DirectoryEntry.findAll({
      raw: true,
      order: [
        ['isFeatured', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: 120,
    });
    entries = rows as unknown as HomeEntry[];
  } catch (error) {
    console.error('Failed to load homepage entries:', error);
    loadError = true;
  }

  const featured = entries.slice(0, 9);
  const latest = entries.slice(0, 60);

  const categories = [...entries.reduce((acc, entry) => {
    if (!entry.category) return acc;
    acc.set(entry.category, (acc.get(entry.category) ?? 0) + 1);
    return acc;
  }, new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const cities = [...entries.reduce((acc, entry) => {
    if (!entry.city) return acc;
    acc.set(entry.city, (acc.get(entry.city) ?? 0) + 1);
    return acc;
  }, new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], index) => ({
      name,
      count,
      gradient: cityGradients[index % cityGradients.length],
    }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-gradient-to-br from-white via-sky-50 to-amber-50">
        <header className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 mb-4">
                <HeartPulse className="h-3.5 w-3.5" />
                Spain-wide trusted directory
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                Spain English Directory
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                Discover English-speaking services across Spain with verified, claimable listings and practical city/category filters.
              </p>
              {!loadError && (
                <p className="mt-3 text-sm text-slate-500">{latest.length} latest listings loaded</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Explore Search
              </Link>
              <Link
                href="/admin/claims"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8 max-w-3xl">
            <SearchBar large />
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-12 space-y-14">
        {loadError ? (
          <div className="bg-white border rounded-xl p-6 text-red-600">
            Unable to load listings right now. Please check your database connection.
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-slate-600">
            No listings found. Run <code>npm run db:seed</code> to populate data.
          </div>
        ) : (
          <>
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
                <Link href="/search" className="text-sm font-medium text-blue-700 hover:text-blue-900">
                  View all listings →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {featured.map((entry) => (
                  <ListingCard
                    key={entry.id}
                    compact
                    listing={{
                      ...entry,
                      address: entry.address || `${entry.city}, ${entry.province || 'Spain'}`,
                      languages: ['English', 'Spanish'],
                      reviewCount: 0,
                      rating: 4.7,
                      specialties: entry.specialties || [],
                    }}
                  />
                ))}
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Browse by Category</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((item) => (
                    <CategoryCard
                      key={item.name}
                      title={item.name}
                      description={`English-speaking ${item.name.toLowerCase()} listings across Spain.`}
                      icon={categoryIcon(item.name)}
                      href={`/search?category=${encodeURIComponent(item.name)}`}
                      count={item.count}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Browse by City</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {cities.map((item) => (
                    <CityCard
                      key={item.name}
                      name={item.name}
                      href={`/search?city=${encodeURIComponent(item.name)}`}
                      professionalCount={item.count}
                      imageUrl={item.gradient}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
