import ClaimButton from "@/components/claims/ClaimButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Spain English Directory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Directory of English-speaking services in Spain
          </p>
        </div>
        <Link
          href="/admin/claims"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
        >
          Admin Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Dr. Sarah Johnson</h3>
                <p className="text-sm text-gray-500">Healthcare • Madrid</p>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Unclaimed
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              English-speaking general practitioner with 15 years experience.
            </p>
            <div className="mt-4 pt-4 border-t">
              <ClaimButton
                listingId={1}
                listingName="Dr. Sarah Johnson"
                isClaimed={false}
              />
            </div>
          </div>

          <div className="border rounded-lg p-6 opacity-75">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">ABC Legal Services</h3>
                <p className="text-sm text-gray-500">Legal • Barcelona</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                Claimed
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Full-service law firm specializing in immigration and real estate.
            </p>
            <div className="mt-4 pt-4 border-t">
              <ClaimButton
                listingId={2}
                listingName="ABC Legal Services"
                isClaimed={true}
              />
            </div>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Sunset Realty</h3>
                <p className="text-sm text-gray-500">Real Estate • Valencia</p>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Unclaimed
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Property sales and rentals for international buyers.
            </p>
            <div className="mt-4 pt-4 border-t">
              <ClaimButton
                listingId={3}
                listingName="Sunset Realty"
                isClaimed={false}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
