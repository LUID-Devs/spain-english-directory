import { DirectoryEntry, Review } from '@/models';
import { Op } from 'sequelize';
import { cities } from './cities';
import { categories } from './categories';
import { DirectoryListing, ListingsResponse } from './listing-types';

// Server-only database fetching function
export async function getListingsFromDB(
  citySlug: string,
  categorySlug: string,
  filters?: {
    specialty?: string;
    language?: string;
    page?: number;
    limit?: number;
  }
): Promise<ListingsResponse> {
  const city = cities.find(c => c.slug === citySlug);
  const category = categories.find(c => c.slug === categorySlug);
  
  if (!city || !category) {
    return { listings: [], total: 0, page: 1, totalPages: 0 };
  }
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  
  // Build where clause
  const where: any = {
    city: city.name,
    category: {
      [Op.iLike]: `%${category.name}%`,
    },
  };
  
  // Fetch from database with reviews
  const { count, rows: entries } = await DirectoryEntry.findAndCountAll({
    where,
    include: [
      {
        model: Review,
        as: 'reviews',
        required: false,
      },
    ],
    limit,
    offset: (page - 1) * limit,
    order: [
      ['isFeatured', 'DESC'],
      ['isVerified', 'DESC'],
      ['name', 'ASC'],
    ],
  });
  
  // Map to DirectoryListing format
  let listings: DirectoryListing[] = entries.map(entry => {
    const reviews = entry.reviews || [];
    const ratingSum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    const reviewCount = reviews.length;
    const rating = reviewCount > 0 ? Math.round((ratingSum / reviewCount) * 10) / 10 : 0;
    
    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      city: entry.city,
      address: entry.address || '',
      phone: entry.phone || '',
      email: entry.email || '',
      website: entry.website || undefined,
      description: entry.description || '',
      specialties: category.specialties.slice(0, 3),
      languages: entry.speaksEnglish ? ['English', 'Spanish'] : ['Spanish'],
      rating,
      reviewCount,
      isVerified: entry.isVerified,
      isFeatured: entry.isFeatured,
    };
  });
  
  // Apply specialty filter if provided
  if (filters?.specialty) {
    listings = listings.filter(l => 
      l.specialties.some(s => s.toLowerCase().includes(filters.specialty!.toLowerCase()))
    );
  }
  
  // Apply language filter if provided
  if (filters?.language) {
    const langLower = filters.language.toLowerCase();
    listings = listings.filter(l => 
      l.languages.some(lang => lang.toLowerCase().includes(langLower))
    );
  }
  
  const total = listings.length;
  const totalPages = Math.ceil(total / limit);
  
  return {
    listings,
    total,
    page,
    totalPages,
  };
}
