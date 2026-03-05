'use client';

import { useEffect, useState } from 'react';

interface RelatedProfessional {
  id: number;
  name: string;
  slug: string;
  category: string;
  city: string;
  description?: string;
}

interface RelatedProfessionalsProps {
  currentSlug: string;
  category: string;
  city: string;
}

export default function RelatedProfessionals({ currentSlug, category, city }: RelatedProfessionalsProps) {
  const [relatedProfessionals, setRelatedProfessionals] = useState<RelatedProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const params = new URLSearchParams({
          slug: currentSlug,
          category: category,
          city: city,
          limit: '4',
        });

        const res = await fetch(`/api/professionals/related?${params}`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProfessionals(data);
        }
      } catch (error) {
        console.error('Error fetching related professionals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [currentSlug, category, city]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Professionals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProfessionals.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Professionals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProfessionals.map((related) => (
          <a
            key={related.id}
            href={`/professional/${related.slug}`}
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-3 group-hover:scale-105 transition-transform">
              {related.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{related.name}</h3>
            <p className="text-sm text-blue-600">{related.category}</p>
            <p className="text-sm text-gray-500 mt-1">{related.city}</p>
            {related.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {related.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
