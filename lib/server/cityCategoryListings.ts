import { Op, WhereOptions } from 'sequelize';
import { DirectoryEntry } from '@/models';
import { getCityBySlug } from '@/lib/data/cities';
import { getCategoryBySlug } from '@/lib/data/categories';
import type { DirectoryListing } from '@/lib/data/listings';

type DirectoryEntryRow = {
  id: number;
  name: string;
  category: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  specialties?: unknown;
  speaksEnglish?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
};

export interface CityCategoryListingQuery {
  citySlug: string;
  categorySlug: string;
  page?: number;
  limit?: number;
  specialty?: string | null;
  language?: string | null;
}

export interface CityCategoryListingResult {
  listings: DirectoryListing[];
  total: number;
  page: number;
  totalPages: number;
  specialty: string | null;
  language: string | null;
  availableSpecialties: string[];
  availableLanguages: string[];
}

function normalizeSpecialties(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  return [];
}

function mapRowToListing(row: DirectoryEntryRow): DirectoryListing {
  const specialties = normalizeSpecialties(row.specialties);
  const speaksEnglish = row.speaksEnglish ?? true;
  const languages = speaksEnglish ? ['English', 'Spanish'] : ['Spanish'];

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    city: row.city,
    address: row.address || `${row.city}, Spain`,
    phone: row.phone || undefined,
    email: row.email || undefined,
    website: row.website || undefined,
    description: row.description || 'No description available.',
    specialties,
    languages,
    rating: row.isVerified ? 4.8 : 4.5,
    reviewCount: 0,
  };
}

export async function getCityCategoryListings(
  query: CityCategoryListingQuery
): Promise<CityCategoryListingResult> {
  const city = getCityBySlug(query.citySlug);
  const category = getCategoryBySlug(query.categorySlug);

  if (!city || !category) {
    return {
      listings: [],
      total: 0,
      page: 1,
      totalPages: 0,
      specialty: query.specialty ?? null,
      language: query.language ?? null,
      availableSpecialties: [],
      availableLanguages: ['English', 'Spanish'],
    };
  }

  const limit = Math.max(1, Math.min(100, query.limit ?? 20));
  const requestedPage = Math.max(1, query.page ?? 1);
  const specialty = query.specialty?.trim() || null;
  const language = query.language?.trim() || null;

  const where: WhereOptions = {
    city: { [Op.iLike]: city.name },
    category: { [Op.iLike]: category.name },
  };

  const rows = (await DirectoryEntry.findAll({
    where,
    order: [
      ['isFeatured', 'DESC'],
      ['isVerified', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    raw: true,
  })) as unknown as DirectoryEntryRow[];

  const allListings = rows.map(mapRowToListing);

  const availableSpecialties = Array.from(
    new Set(allListings.flatMap((listing) => listing.specialties || []))
  ).sort((a, b) => a.localeCompare(b));

  let filtered = allListings;

  if (specialty) {
    const wanted = specialty.toLowerCase();
    filtered = filtered.filter((listing) =>
      (listing.specialties || []).some((item) => item.toLowerCase() === wanted)
    );
  }

  if (language) {
    const wanted = language.toLowerCase();
    filtered = filtered.filter((listing) =>
      (listing.languages || []).some((item) => item.toLowerCase() === wanted)
    );
  }

  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = (page - 1) * limit;
  const listings = filtered.slice(offset, offset + limit);

  return {
    listings,
    total,
    page,
    totalPages,
    specialty,
    language,
    availableSpecialties,
    availableLanguages: ['English', 'Spanish'],
  };
}
