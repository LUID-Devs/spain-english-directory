// Re-export types for convenience
export type { DirectoryListing, ListingsResponse } from './listing-types';

// Client-side function to fetch listings from API
export async function fetchListings(
  citySlug: string,
  categorySlug: string,
  filters?: {
    specialty?: string;
    language?: string;
    page?: number;
    limit?: number;
  }
): Promise<import('./listing-types').ListingsResponse> {
  const params = new URLSearchParams();
  params.set('city', citySlug);
  params.set('category', categorySlug);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.specialty) params.set('specialty', filters.specialty);
  if (filters?.language) params.set('language', filters.language);
  
  const response = await fetch(`/api/listings?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch listings');
  }
  
  return result.data;
}
