"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFilterSidebarProps {
  categories: string[];
  cities: string[];
}

export default function SearchFilterSidebar({ categories, cities }: SearchFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categoryQuery, setCategoryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const currentCategory = searchParams.get("category") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSearch = searchParams.get("q") || "";

  const filteredCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => category.toLowerCase().includes(query));
  }, [categories, categoryQuery]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return cities;
    return cities.filter((city) => city.toLowerCase().includes(query));
  }, [cities, cityQuery]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  const clearFilter = (key: "category" | "city" | "q") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  };

  const clearAllFilters = () => {
    router.push("/search");
  };

  const hasAnyFilter = Boolean(currentCategory || currentCity || currentSearch);

  return (
    <aside className="w-full lg:w-72 space-y-6 lg:sticky lg:top-24 lg:self-start">
      {hasAnyFilter && (
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Active Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSearch && (
              <button
                onClick={() => clearFilter("q")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                Search: {currentSearch} ×
              </button>
            )}
            {currentCategory && (
              <button
                onClick={() => clearFilter("category")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                Category: {currentCategory} ×
              </button>
            )}
            {currentCity && (
              <button
                onClick={() => clearFilter("city")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                City: {currentCity} ×
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="font-semibold text-foreground mb-3">Category</h3>
        <input
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder="Search categories..."
          className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
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
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {filteredCategories.map((category) => (
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
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="font-semibold text-foreground mb-3">City</h3>
        <input
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="Search cities..."
          className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
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
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filteredCities.map((city) => (
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
      </div>

      {hasAnyFilter && (
        <button
          onClick={clearAllFilters}
          className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          Clear Filters
        </button>
      )}
    </aside>
  );
}
