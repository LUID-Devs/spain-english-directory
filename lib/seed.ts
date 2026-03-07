import { 
  sequelize, 
  Category, 
  City, 
  Professional, 
  Review, 
  Lead,
  ListingType,
  LeadStatus,
  ProfessionalEnglishLevel 
} from '../models';

async function seed() {
  try {
    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Create Categories
    const categories = await Category.bulkCreate([
      { name: 'Healthcare', slug: 'healthcare', description: 'Doctors, dentists, therapists, and medical services', icon: 'medical' },
      { name: 'Legal', slug: 'legal', description: 'Lawyers, solicitors, and legal advisors', icon: 'balance' },
      { name: 'Living', slug: 'living', description: 'Real estate, relocation, and home services', icon: 'home' },
      { name: 'Business', slug: 'business', description: 'Accountants, consultants, and business services', icon: 'business' },
      { name: 'Education', slug: 'education', description: 'Schools, tutors, and language learning', icon: 'school' },
      { name: 'Services', slug: 'services', description: 'General services and trades', icon: 'build' },
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    // Create Cities
    const cities = await City.bulkCreate([
      { name: 'Madrid', slug: 'madrid', province: 'Madrid', region: 'Community of Madrid' },
      { name: 'Barcelona', slug: 'barcelona', province: 'Barcelona', region: 'Catalonia' },
      { name: 'Valencia', slug: 'valencia', province: 'Valencia', region: 'Valencian Community' },
      { name: 'Málaga', slug: 'malaga', province: 'Málaga', region: 'Andalusia' },
      { name: 'Seville', slug: 'seville', province: 'Seville', region: 'Andalusia' },
      { name: 'Alicante', slug: 'alicante', province: 'Alicante', region: 'Valencian Community' },
      { name: 'Bilbao', slug: 'bilbao', province: 'Biscay', region: 'Basque Country' },
      { name: 'Palma de Mallorca', slug: 'palma-de-mallorca', province: 'Balearic Islands', region: 'Balearic Islands' },
      { name: 'Almería', slug: 'almeria', province: 'Almería', region: 'Andalusia' },
    ]);
    console.log(`✅ Created ${cities.length} cities`);

    // Create Professionals
    const professionals = await Professional.bulkCreate([
      {
        name: 'Dr. Sarah Johnson',
        email: 'dr.johnson@medicamadrid.es',
        phone: '+34 912 345 678',
        website: 'https://medicamadrid.es',
        categoryId: 1, // Healthcare
        cityId: 1, // Madrid
        address: 'Calle de Alcalá 123',
        postalCode: '28009',
        description: 'English-speaking GP with 15 years experience. Specializes in expat healthcare needs.',
        speaksEnglish: true,
        isVerified: true,
        isFeatured: true,
        listingType: ListingType.PREMIUM,
      },
      {
        name: 'Smith & Associates Legal',
        email: 'info@smithlegal.es',
        phone: '+34 933 456 789',
        website: 'https://smithlegal.es',
        categoryId: 2, // Legal
        cityId: 2, // Barcelona
        address: 'Passeig de Gràcia 45',
        postalCode: '08007',
        description: 'International law firm specializing in property, residency, and business law.',
        speaksEnglish: true,
        isVerified: true,
        isFeatured: true,
        listingType: ListingType.FEATURED,
      },
      {
        name: 'Costa Blanca Realty',
        email: 'hello@costablancarealty.com',
        phone: '+34 965 123 456',
        website: 'https://costablancarealty.com',
        categoryId: 3, // Living
        cityId: 6, // Alicante
        address: 'Avenida de la Costa 78',
        postalCode: '03001',
        description: 'Helping English-speaking families find their dream home on the Costa Blanca.',
        speaksEnglish: true,
        isVerified: true,
        isFeatured: false,
        listingType: ListingType.FREE,
      },
      {
        name: 'Expat Tax Advisors',
        email: 'tax@expattax.es',
        phone: '+34 951 987 654',
        website: 'https://expattax.es',
        categoryId: 4, // Business
        cityId: 4, // Málaga
        address: 'Calle Marqués de Larios 12',
        postalCode: '29005',
        description: 'Tax planning and compliance for UK and US expats living in Spain.',
        speaksEnglish: true,
        isVerified: false,
        isFeatured: false,
        listingType: ListingType.FREE,
      },
      {
        name: 'Andalusia Language Academy',
        email: 'learn@andalusialang.com',
        phone: '+34 955 789 012',
        website: 'https://andalusialang.com',
        categoryId: 5, // Education
        cityId: 5, // Seville
        address: 'Calle Sierpes 34',
        postalCode: '41004',
        description: 'Spanish classes for English speakers. Intensive and regular courses available.',
        speaksEnglish: true,
        isVerified: true,
        isFeatured: false,
        listingType: ListingType.FREE,
      },
      {
        name: 'Valencia Property (Graham Hunt)',
        email: 'information@valencia-property.com',
        phone: '+34 657 994 311',
        website: 'https://www.valencia-property.com',
        categoryId: 3, // Living
        cityId: 3, // Valencia
        address: 'Avenida Jose Garrigo Farga 33, Bajo Dcha',
        postalCode: '46185',
        description: 'English-speaking real estate agency in Valencia specializing in apartment and villa sales for expats. Founded by Graham Hunt after his own frustrating experience with local agents. Offers a buyer-focused approach with end-to-end support including property search, viewings, price negotiation, mortgage assistance, legal due diligence, and NIE coordination. Highly recommended on Reddit r/valencia for honest, transparent service and deep market knowledge.',
        speaksEnglish: true,
        englishLevel: ProfessionalEnglishLevel.NATIVE,
        specialties: ['Sales', 'Investment', 'Relocation', 'Property Management'],
        isVerified: true,
        isFeatured: false,
        listingType: ListingType.FREE,
      },
      {
        name: 'International Doctor 24h',
        email: 'info@internationaldoctor24h.com',
        phone: '+34 678 752 098',
        website: 'https://internationaldoctor24h.com',
        categoryId: 1, // Healthcare
        cityId: 1, // Madrid
        address: 'Available across Madrid city center and surrounding areas',
        postalCode: '28001',
        description: '24/7 English-speaking urgent care service for tourists and residents in Madrid. Specializes in home and hotel doctor visits, walk-in clinic access, emergency medical services, pediatric care, and ambulance coordination. No appointment needed. Covers all major areas including Gran Vía, Sol, Chamberí, Salamanca, La Latina, Moncloa, and Barajas. Fluent English-speaking doctors with experience treating international patients. Accepts private medical insurance.',
        speaksEnglish: true,
        englishLevel: ProfessionalEnglishLevel.NATIVE,
        specialties: ['Urgent Care', 'Home Doctor Visits', 'Pediatrics', 'Emergency Medicine', 'Tourist Healthcare'],
        isVerified: true,
        isFeatured: true,
        listingType: ListingType.FEATURED,
      },
      {
        name: 'Scudamore Law',
        email: 'mail@scudamorelaw.com',
        phone: '+34 915 939 126',
        website: 'https://www.scudamorelaw.com',
        categoryId: 2, // Legal
        cityId: 1, // Madrid
        address: 'Plaza de Castilla, 3 – 15º E2, 28046 Madrid',
        postalCode: '28046',
        description: 'English-speaking law firm with offices in Madrid, Almería and London. Over 20 years of Spanish and English legal experience specializing in property law, visas (including Digital Nomad Visas), probate & inheritance, family law, and business law. Bilingual English-Spanish lawyers providing clear, practical advice delivered to British standards of professionalism. Expert in cross-border legal issues and supporting expats with property transactions, residency matters, and legal protection in Spain.',
        speaksEnglish: true,
        englishLevel: ProfessionalEnglishLevel.NATIVE,
        specialties: ['Property Law', 'Visas & Immigration', 'Probate & Inheritance', 'Family Law', 'Business Law'],
        isVerified: true,
        isFeatured: true,
        listingType: ListingType.FEATURED,
      },
      {
        name: 'Scudamore Law',
        email: 'mail@scudamorelaw.com',
        phone: '+34 950 900 001',
        website: 'https://www.scudamorelaw.com',
        categoryId: 2, // Legal
        cityId: 9, // Almería
        address: 'By appointment - contact office',
        postalCode: '04001',
        description: 'English-speaking law firm with offices in Madrid, Almería and London. Over 20 years of Spanish and English legal experience specializing in property law, visas (including Digital Nomad Visas), probate & inheritance, family law, and business law. Bilingual English-Spanish lawyers providing clear, practical advice delivered to British standards of professionalism. Expert in cross-border legal issues and supporting expats with property transactions, residency matters, and legal protection in Spain. Almería office operates by appointment.',
        speaksEnglish: true,
        englishLevel: ProfessionalEnglishLevel.NATIVE,
        specialties: ['Property Law', 'Visas & Immigration', 'Probate & Inheritance', 'Family Law', 'Business Law'],
        isVerified: true,
        isFeatured: true,
        listingType: ListingType.FEATURED,
      },
      {
        name: 'Sinews Multilingual Therapy Institute',
        email: 'info@sinews.es',
        phone: '+34 917 00 19 79',
        website: 'https://www.sinews.es',
        categoryId: 1, // Healthcare
        cityId: 1, // Madrid
        address: 'Calle Sagasta 16, Bajo Derecha, 28004 Madrid',
        postalCode: '28004',
        description: 'Multilingual therapy centre in Madrid offering comprehensive mental health services for expats and international families. Team of native professionals providing psychology (individual, couples, and family), psychiatry, speech therapy, and coaching services in over 12 languages including English, Spanish, German, Italian, Portuguese, Hebrew, and Polish. Specializes in psycho-educational assessments for ADHD, dyslexia, and giftedness. Offers both in-person therapy at their Chamberí office and online sessions. Services include diagnostic assessments, ongoing therapeutic intervention, and prescription refills recognized in most EU countries. Friendly English-speaking reception team available via phone, WhatsApp, and email.',
        speaksEnglish: true,
        englishLevel: ProfessionalEnglishLevel.NATIVE,
        specialties: ['Psychology', 'Psychiatry', 'Speech Therapy', 'Coaching', 'Psycho-educational Assessments'],
        isVerified: true,
        isFeatured: false,
        listingType: ListingType.FREE,
      },
    ]);
    console.log(`✅ Created ${professionals.length} professionals`);

    // Create Reviews
    const reviews = await Review.bulkCreate([
      {
        professionalId: 1,
        rating: 5,
        comment: 'Dr. Johnson is fantastic! Made me feel at home and explained everything clearly in English.',
        reviewerName: 'Michael T.',
        isVerified: true,
      },
      {
        professionalId: 1,
        rating: 5,
        comment: 'Very professional and great bedside manner. Highly recommend for expats.',
        reviewerName: 'Jennifer L.',
        isVerified: true,
      },
      {
        professionalId: 2,
        rating: 4,
        comment: 'Helped us navigate the property purchase process smoothly. Good value.',
        reviewerName: 'Robert H.',
        isVerified: true,
      },
      {
        professionalId: 3,
        rating: 5,
        comment: 'Found us the perfect apartment within a week. Excellent service!',
        reviewerName: 'Susan M.',
        isVerified: false,
      },
    ]);
    console.log(`✅ Created ${reviews.length} reviews`);

    // Create Leads
    const leads = await Lead.bulkCreate([
      {
        professionalId: 1,
        requesterName: 'David Wilson',
        requesterEmail: 'david.wilson@email.com',
        message: 'Hello, I need to book a general health checkup. Do you accept new patients?',
        status: LeadStatus.NEW,
      },
      {
        professionalId: 2,
        requesterName: 'Emma Thompson',
        requesterEmail: 'emma.t@email.com',
        message: 'I need help with a property purchase contract review. Can we schedule a consultation?',
        status: LeadStatus.CONTACTED,
      },
      {
        professionalId: 3,
        requesterName: 'James Brown',
        requesterEmail: 'james.brown@email.com',
        message: 'Looking for a 3-bedroom apartment near the beach for long-term rental.',
        status: LeadStatus.NEW,
      },
    ]);
    console.log(`✅ Created ${leads.length} leads`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed();
}

export default seed;
