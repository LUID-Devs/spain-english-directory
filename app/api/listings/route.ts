import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry, Review } from '@/models';
import { Op } from 'sequelize';
import { cities } from '@/lib/data/cities';
import { categories } from '@/lib/data/categories';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const citySlug = searchParams.get('city');
    const categorySlug = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const specialty = searchParams.get('specialty');
    const language = searchParams.get('language');
    
    if (!citySlug || !categorySlug) {
      return NextResponse.json(
        { success: false, error: 'City and category are required' },
        { status: 400 }
      );
    }
    
    const city = cities.find(c => c.slug === citySlug);
    const category = categories.find(c => c.slug === categorySlug);
    
    if (!city || !category) {
      return NextResponse.json(
        { success: false, error: 'Invalid city or category' },
        { status: 400 }
      );
    }
    
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
    let listings = entries.map(entry => {
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
    if (specialty) {
      listings = listings.filter(l => 
        l.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }
    
    // Apply language filter if provided
    if (language) {
      const langLower = language.toLowerCase();
      listings = listings.filter(l => 
        l.languages.some(lang => lang.toLowerCase().includes(langLower))
      );
    }
    
    const total = listings.length;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        listings,
        total,
        page,
        totalPages,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch listings',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
