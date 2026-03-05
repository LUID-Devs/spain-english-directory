"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
}

export default function SearchBar({ initialQuery = "", large = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative flex items-center ${large ? "max-w-2xl mx-auto" : ""}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for doctors, lawyers, services..."
          className={`w-full rounded-full border border-border bg-white px-5 pr-32 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            large ? "py-4 text-lg" : "py-3 text-base"
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 rounded-full bg-primary px-6 font-medium text-white hover:bg-primary-dark transition-colors ${
            large ? "py-2.5 text-base" : "py-1.5 text-sm"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
