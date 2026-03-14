import ClaimButton from "@/components/claims/ClaimButton";
import Link from "next/link";
import { initDb, DirectoryEntry } from "@/lib/initDb";

interface HomeEntry {
  id: number;
  name: string;
  category: string;
  city: string;
  description?: string | null;
  isClaimed: boolean;
}

export default async function Home() {
  let entries: HomeEntry[] = [];
  let loadError = false;

  try {
    await initDb();
    const rows = await DirectoryEntry.findAll({
      raw: true,
      order: [
        ["isFeatured", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: 60,
    });
    entries = rows as unknown as HomeEntry[];
  } catch (error) {
    console.error("Failed to load homepage entries:", error);
    loadError = true;
  }

  return (
    <div className="min-h-screen p-8 pb-20">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Spain English Directory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Directory of English-speaking services in Spain
          </p>
          {!loadError && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {entries.length} latest listings
            </p>
          )}
        </div>
        <Link
          href="/admin/claims"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
        >
          Admin Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        {loadError ? (
          <div className="border rounded-lg p-6 text-red-600">
            Unable to load listings right now. Please check your database connection.
          </div>
        ) : entries.length === 0 ? (
          <div className="border rounded-lg p-6 text-gray-600">
            No listings found. Run <code>npm run db:seed</code> to populate data.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{entry.name}</h3>
                    <p className="text-sm text-gray-500">
                      {entry.category} • {entry.city}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      entry.isClaimed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.isClaimed ? "Claimed" : "Unclaimed"}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {entry.description?.trim() || "No description available."}
                </p>
                <div className="mt-4 pt-4 border-t">
                  <ClaimButton
                    listingId={entry.id}
                    listingName={entry.name}
                    isClaimed={entry.isClaimed}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
