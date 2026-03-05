'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  initialQuery?: string;
  initialCity?: string;
}

export default function SearchBar({ variant = 'hero', initialQuery = '', initialCity = '' }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    router.push(`/search?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${isHero ? 'w-full max-w-3xl' : 'w-full'}`}>
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for doctors, lawyers, services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spain-red focus:border-transparent outline-none transition-all ${
            isHero ? 'py-4 text-lg' : 'py-3'
          }`}
        />
      </div>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className={`px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spain-red focus:border-transparent outline-none bg-white ${
          isHero ? 'py-4 text-lg' : 'py-3'
        }`}
      >
        <option value="">All Cities</option>
        <option value="madrid">Madrid</option>
        <option value="barcelona">Barcelona</option>
        <option value="valencia">Valencia</option>
        <option value="malaga">Málaga</option>
        <option value="seville">Seville</option>
        <option value="alicante">Alicante</option>
      </select>
      <button
        type="submit"
        className={`bg-spain-red hover:bg-spain-redLight text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
          isHero ? 'px-8 py-4 text-lg' : 'px-6 py-3'
        }`}
      >
        <Search size={20} />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
