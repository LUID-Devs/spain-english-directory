"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SearchFilterSidebarProps {
  categories: string[];
  cities: string[];
}

export default function SearchFilterSidebar({ categories, cities }: SearchFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentCity = searchParams.get("city") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <aside className="w-full lg:w-64 space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter("category", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentCategory
                ? "bg-primary text-white"
                : "text-foreground hover:bg-muted"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilter("category", category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentCategory === category
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">City</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter("city", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentCity
                ? "bg-primary text-white"
                : "text-foreground hover:bg-muted"
            }`}
          >
            All Cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => updateFilter("city", city)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentCity === city
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {(currentCategory || currentCity) && (
        <button
          onClick={() => router.push("/search")}
          className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          Clear Filters
        </button>
      )}
    </aside>
  );
}
