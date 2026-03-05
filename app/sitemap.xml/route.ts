import { MetadataRoute } from 'next';
import { Category, City, DirectoryEntry } from '@/models';

const BASE_URL = 'https://spainenglishdirectory.com';

export async function GET(): Promise<Response> {
  try {
    // Fetch all cities and categories
    const [cities, categories, entries] = await Promise.all([
      City.findAll({ attributes: ['slug', 'updatedAt'] }),
      Category.findAll({ attributes: ['slug', 'updatedAt'] }),
      DirectoryEntry.findAll({ attributes: ['id', 'updatedAt'] }),
    ]);

    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Home page
    sitemapEntries.push({
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });

    // City pages (when they exist)
    for (const city of cities) {
      sitemapEntries.push({
        url: `${BASE_URL}/${city.slug}`,
        lastModified: city.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Category pages (when they exist)
    for (const category of categories) {
      sitemapEntries.push({
        url: `${BASE_URL}/categories/${category.slug}`,
        lastModified: category.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // City + Category combination pages (main SEO landing pages)
    for (const city of cities) {
      for (const category of categories) {
        sitemapEntries.push({
          url: `${BASE_URL}/${city.slug}/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }

    // Individual entry pages
    for (const entry of entries) {
      sitemapEntries.push({
        url: `${BASE_URL}/professionals/${entry.id}`,
        lastModified: entry.updatedAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    // Generate XML
    const xml = generateSitemapXml(sitemapEntries);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal sitemap on error
    const fallbackXml = generateSitemapXml([
      { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ]);
    
    return new Response(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}

function generateSitemapXml(entries: MetadataRoute.Sitemap): string {
  const urlEntries = entries
    .map((entry) => {
      const url = escapeXml(entry.url);
      const lastMod = entry.lastModified 
        ? new Date(entry.lastModified).toISOString()
        : new Date().toISOString();
      const changeFreq = entry.changeFrequency || 'weekly';
      const priority = entry.priority || 0.5;

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
