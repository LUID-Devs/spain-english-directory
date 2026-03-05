import { NextRequest, NextResponse } from 'next/server';
import { Op, WhereOptions } from 'sequelize';
import DirectoryEntry from '@/models/DirectoryEntry';

export const dynamic = 'force-dynamic';

interface SearchFilters {
  query?: string;
  city?: string;
  category?: string;
  featured?: string;
  verified?: string;
  page?: string;
  limit?: string;
}

interface SearchResult {
  data: DirectoryEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: SearchFilters = {
      query: searchParams.get('query') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      featured: searchParams.get('featured') || undefined,
      verified: searchParams.get('verified') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    // Parse pagination
    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '20', 10)));
    const offset = (page - 1) * limit;

    // Build where clause
    const where: WhereOptions = {};
    const searchConditions: WhereOptions[] = [];

    // Full-text search across name, description, category (services)
    if (filters.query && filters.query.trim()) {
      const escapedQuery = filters.query.trim().replace(/[%_\\]/g, '\\$&');
      const searchTerm = `%${escapedQuery}%`;
      searchConditions.push(
        { name: { [Op.iLike]: searchTerm, escape: '\\' } },
        { description: { [Op.iLike]: searchTerm, escape: '\\' } },
        { category: { [Op.iLike]: searchTerm, escape: '\\' } }
      );
    }

    // Filter by city slug (case-insensitive)
    if (filters.city) {
      where.city = { [Op.iLike]: filters.city };
    }

    // Filter by category slug (case-insensitive)
    if (filters.category) {
      where.category = { [Op.iLike]: filters.category };
    }

    // Filter by featured status
    if (filters.featured !== undefined) {
      const featuredValue = filters.featured.toLowerCase();
      if (featuredValue === 'true' || featuredValue === '1') {
        where.isFeatured = true;
      } else if (featuredValue === 'false' || featuredValue === '0') {
        where.isFeatured = false;
      }
    }

    // Filter by verified status
    if (filters.verified !== undefined) {
      const verifiedValue = filters.verified.toLowerCase();
      if (verifiedValue === 'true' || verifiedValue === '1') {
        where.isVerified = true;
      } else if (verifiedValue === 'false' || verifiedValue === '0') {
        where.isVerified = false;
      }
    }

    // Combine search conditions with OR if query exists
    let finalWhere: WhereOptions = { ...where };
    if (searchConditions.length > 0) {
      finalWhere = {
        ...where,
        [Op.or]: searchConditions,
      };
    }

    // Execute search query with pagination
    const { rows: data, count: totalItems } = await DirectoryEntry.findAndCountAll({
      where: finalWhere,
      limit,
      offset,
      order: [
        ['isFeatured', 'DESC'], // Featured first
        ['name', 'ASC'],        // Then alphabetically by name
      ],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    
    const result: SearchResult = {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Log performance
    const duration = Date.now() - startTime;
    console.log(`Search completed in ${duration}ms - Found ${totalItems} results`);

    // Return response
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      meta: {
        query: filters.query || null,
        filters: {
          city: filters.city || null,
          category: filters.category || null,
          featured: filters.featured || null,
          verified: filters.verified || null,
        },
        duration: `${duration}ms`,
      },
    }, {
      status: 200,
      headers: {
        'X-Response-Time': `${duration}ms`,
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Search error after ${duration}ms:`, error);

    // Handle empty results gracefully
    return NextResponse.json({
      success: false,
      error: 'Failed to perform search',
      message: 'An unexpected error occurred. Please try again later.',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false,
      },
      meta: {
        duration: `${duration}ms`,
      },
    }, {
      status: 500,
      headers: {
        'X-Response-Time': `${duration}ms`,
      },
    });
  }
}
