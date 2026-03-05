import { 
  sequelize, 
  Category, 
  City, 
  Professional, 
  Review, 
  Lead,
  ListingType,
  LeadStatus 
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
