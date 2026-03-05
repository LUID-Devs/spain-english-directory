import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContactForm from '@/components/ContactForm';
import RelatedProfessionals from '@/components/RelatedProfessionals';

interface ProfessionalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Use dynamic rendering to avoid build-time DB connection
export const dynamic = 'force-dynamic';

// Helper function to get professional data
async function getProfessional(slug: string) {
  // Dynamic import to avoid build-time DB connection
  const { DirectoryEntry } = await import('@/models');
  return await DirectoryEntry.findOne({ where: { slug } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateMetadata({ params }: ProfessionalPageProps): Promise<Metadata> {
  // Return static metadata since we can't access DB at build time
  return {
    title: 'Professional Profile | Spain English Directory',
    description: 'View professional services and contact information on Spain English Directory.',
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      siteName: 'Spain English Directory',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
  const { slug } = await params;

  let professional;
  try {
    professional = await getProfessional(slug);
  } catch (error) {
    console.error('Database error:', error);
    notFound();
  }

  if (!professional) {
    notFound();
  }

  // Generate JSON-LD schema markup
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: professional.name,
    description: professional.description || `${professional.name} provides ${professional.category} services`,
    url: `/professional/${slug}`,
    telephone: professional.phone,
    email: professional.email,
    address: professional.address ? {
      '@type': 'PostalAddress',
      streetAddress: professional.address,
      addressLocality: professional.city,
      addressRegion: professional.province,
      addressCountry: 'ES',
    } : undefined,
    areaServed: {
      '@type': 'City',
      name: professional.city,
    },
    serviceType: professional.category,
    knowsLanguage: ['English', 'Spanish'],
    ...(professional.website && { sameAs: professional.website }),
  };

  const fullAddress = [
    professional.address,
    professional.city,
    professional.province,
  ].filter(Boolean).join(', ');

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 flex-wrap">
              <a href="/" className="hover:text-blue-600 transition-colors">
                Home
              </a>
              <span>/</span>
              <a 
                href={`/${professional.city.toLowerCase().replace(/\s+/g, '-')}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {professional.city}
              </a>
              <span>/</span>
              <a 
                href={`/${professional.city.toLowerCase().replace(/\s+/g, '-')}/${professional.category.toLowerCase().replace(/\s+/g, '-')}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {professional.category}
              </a>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px]">{professional.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Main Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
              <div className="absolute -bottom-12 left-6 md:left-8">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600">
                  {professional.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="pt-16 px-6 md:px-8 pb-8">
              {/* Name and Category */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{professional.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {professional.category}
                    </span>
                    {professional.speaksEnglish && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        🇬🇧 English Speaking
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                {professional.email && (
                  <a
                    href="#contact-form"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Contact Now
                  </a>
                )}
              </div>

              {/* Location */}
              <div className="mt-6 flex items-start text-gray-600">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{fullAddress || professional.city}</span>
              </div>

              {/* Description */}
              {professional.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {professional.description}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {professional.phone && (
                    <a
                      href={`tel:${professional.phone}`}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900 font-medium truncate">{professional.phone}</p>
                      </div>
                    </a>
                  )}

                  {professional.email && (
                    <a
                      href={`mailto:${professional.email}`}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900 font-medium truncate">{professional.email}</p>
                      </div>
                    </a>
                  )}

                  {professional.website && (
                    <a
                      href={professional.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Website</p>
                        <p className="text-gray-900 font-medium truncate">
                          {professional.website.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          {professional.email && (
            <div id="contact-form" className="mt-8 bg-white rounded-2xl shadow-sm border p-6 md:p-8">
              <ContactForm 
                professionalSlug={professional.slug} 
                professionalName={professional.name} 
              />
            </div>
          )}

          {/* Related Professionals */}
          <RelatedProfessionals 
            currentSlug={professional.slug}
            category={professional.category}
            city={professional.city}
          />
        </div>
      </main>
    </>
  );
}
