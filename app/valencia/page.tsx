import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Stethoscope, HeartPulse, Brain, Phone, Users, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'English-Speaking Doctors in Valencia | Spain English Directory',
  description: 'Find verified English-speaking doctors, dentists, and healthcare providers in Valencia. Connect with medical professionals who speak your language.',
  keywords: [
    'english speaking doctor valencia',
    'english speaking dentist valencia',
    'valencia healthcare expat',
    'english doctor valencia spain',
    'valencia medical services english',
    'expat healthcare valencia',
    'english speaking pediatrician valencia',
    'valencia doctors for foreigners',
  ],
  openGraph: {
    title: 'English-Speaking Healthcare in Valencia',
    description: 'Find verified English-speaking doctors and dentists in Valencia. The directory for expats and digital nomads.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Spain English Directory',
    url: 'https://spainenglishdirectory.com/valencia',
  },
};

const healthcareCategories = [
  {
    slug: 'doctors',
    name: 'Doctors',
    description: 'General practitioners and family doctors who speak English',
    icon: Stethoscope,
    count: 12,
    specialties: ['General Practice', 'Pediatrics', 'Internal Medicine'],
  },
  {
    slug: 'dentists',
    name: 'Dentists',
    description: 'Dental care with English-speaking staff and modern facilities',
    icon: HeartPulse,
    count: 8,
    specialties: ['General Dentistry', 'Orthodontics', 'Cosmetic'],
  },
  {
    slug: 'therapists',
    name: 'Mental Health',
    description: 'Psychologists and therapists for mental wellness support',
    icon: Brain,
    count: 5,
    specialties: ['Psychology', 'Counseling', 'Family Therapy'],
  },
];

const neighborhoods = [
  { name: 'Ruzafa', description: 'Trendy district popular with young expats' },
  { name: 'El Carmen', description: 'Historic center with international community' },
  { name: 'City of Arts and Sciences', description: 'Modern area with family-friendly amenities' },
  { name: 'Malvarrosa', description: 'Beach district with relaxed vibe' },
];

const faqs = [
  {
    question: 'Why is it hard to find English-speaking doctors in Valencia?',
    answer: 'Valencia\'s expat community has grown rapidly, but healthcare services haven\'t kept pace. Many doctors speak basic English, but finding providers fluent enough for complex medical discussions can be challenging. Our directory helps bridge that gap.',
  },
  {
    question: 'Do I need private health insurance to see these doctors?',
    answer: 'Many English-speaking doctors in Valencia work in the private healthcare system. While some public system doctors speak English, private insurance (or paying out-of-pocket) typically gives you access to more English-speaking providers.',
  },
  {
    question: 'Can I book appointments online?',
    answer: 'Most providers in our directory offer online booking or email contact. Each listing includes the best way to reach them. Many also accept phone appointments if you prefer to call.',
  },
];

export default function ValenciaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
              <MapPin className="w-4 h-4" />
              <span>Valencia, Spain</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find English-Speaking Doctors in Valencia
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Valencia&apos;s expat community is growing fast — but finding English-speaking healthcare 
              shouldn&apos;t be hard. Connect with verified doctors, dentists, and specialists who 
              speak your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#categories"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Browse Healthcare Providers
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/claims"
                className="inline-flex items-center justify-center gap-2 bg-blue-600/30 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600/50 transition"
              >
                List Your Practice
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Valencia Healthcare Gap
            </h2>
            <p className="text-lg text-gray-600">
              Thousands of expats and digital nomads call Valencia home. But when it comes to 
              healthcare, language barriers create real problems.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Growing Expat Community</h3>
              <p className="text-gray-600">
                Valencia is one of Spain&apos;s fastest-growing destinations for international residents 
                and remote workers.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Limited English Services</h3>
              <p className="text-gray-600">
                Healthcare providers haven&apos;t kept pace with demand. Finding English-speaking 
                doctors remains a challenge.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Our Solution</h3>
              <p className="text-gray-600">
                A curated directory of verified English-speaking healthcare providers across 
                Valencia and surrounding areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Healthcare Categories in Valencia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our directory of English-speaking healthcare providers by category
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {healthcareCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/valencia/${category.slug}`}
                className="group block bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
                    <category.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {category.count} listings
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/search?city=valencia"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
            >
              View all healthcare categories in Valencia
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Neighborhoods Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Expat Neighborhoods
            </h2>
            <p className="text-lg text-gray-600">
              Find English-speaking healthcare providers in Valencia&apos;s most popular districts
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {neighborhoods.map((neighborhood) => (
              <div
                key={neighborhood.name}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
              >
                <MapPin className="w-5 h-5 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{neighborhood.name}</h3>
                <p className="text-sm text-gray-600">{neighborhood.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Providers Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Are You an English-Speaking Healthcare Provider?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our directory and connect with Valencia&apos;s growing expat community. 
              Thousands of international residents are searching for healthcare providers 
              who speak their language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin/claims"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                List Your Practice
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:contact@spainenglishdirectory.com"
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white border border-blue-500 px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                Contact Us
              </Link>
            </div>
            <p className="mt-6 text-blue-200 text-sm">
              Free basic listings available • Verified badge for qualified providers
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Can&apos;t Find What You&apos;re Looking For?
              </h2>
              <p className="text-gray-400">
                We&apos;re adding new providers weekly. Get notified when English-speaking 
                healthcare providers join in your area.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap"
            >
              Back to Directory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': 'https://spainenglishdirectory.com/valencia',
                url: 'https://spainenglishdirectory.com/valencia',
                name: 'English-Speaking Doctors in Valencia | Spain English Directory',
                description: 'Find verified English-speaking doctors, dentists, and healthcare providers in Valencia.',
                isPartOf: {
                  '@id': 'https://spainenglishdirectory.com',
                },
              },
              {
                '@type': 'City',
                name: 'Valencia',
                containedInPlace: {
                  '@type': 'Country',
                  name: 'Spain',
                },
              },
              {
                '@type': 'ItemList',
                name: 'Healthcare Categories in Valencia',
                itemListElement: healthcareCategories.map((cat, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'Thing',
                    name: cat.name,
                    description: cat.description,
                    url: `https://spainenglishdirectory.com/valencia/${cat.slug}`,
                  },
                })),
              },
              {
                '@type': 'FAQPage',
                mainEntity: faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                  },
                })),
              },
            ],
          }),
        }}
      />
    </div>
  );
}
