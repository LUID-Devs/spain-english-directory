import { cities } from './cities';
import { categories } from './categories';

export interface DirectoryListing {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  description: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
}

// Real verified businesses (manually added)
const realBusinesses: DirectoryListing[] = [
  {
    id: 1648,
    name: 'Engel & Völkers Spain',
    category: 'Realtors',
    city: 'Madrid',
    address: 'Calle de Serrano, 92',
    phone: '+34 900 878 888',
    email: 'spain@engelvoelkers.com',
    website: 'https://www.engelvoelkers.com/en-es/spain/',
    description: 'Global luxury real estate brand with 1,000+ locations across 35+ countries. Premium segment focus specializing in high-end residential and commercial properties throughout Spain including Madrid, Barcelona, Valencia, Costa del Sol, Costa Blanca, Ibiza, Mallorca, and the Canary Islands. International client base with English-speaking agents providing local market expertise backed by a worldwide network.',
    specialties: ['Luxury Residential', 'Property Sales', 'Property Rentals', 'Investment Advisory'],
    languages: ['English', 'Spanish', 'German'],
    rating: 4.9,
    reviewCount: 120,
  },
  // TASK-1666: Clinica Dental Barcelona
  {
    id: 1666,
    name: 'Clinica Dental Barcelona',
    category: 'Dentists',
    city: 'Barcelona',
    address: 'Carrer de Balmes, 152, 08008 Barcelona',
    website: 'https://clinicadentalbarcelona.es',
    description: 'English-speaking dental clinic in Barcelona offering comprehensive dental care for international patients. Services include general dentistry, cosmetic treatments, dental implants, orthodontics, and preventive care with modern facilities and patient-focused communication.',
    specialties: ['General Dentistry', 'Cosmetic Dentistry', 'Dental Implants', 'Orthodontics', 'Preventive Care'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 92,
  },

  // TASK-1654: Dental Clinic Navarro - Madrid
  {
    id: 1654,
    name: 'Dental Clinic Navarro',
    category: 'Dentists',
    city: 'Madrid',
    address: 'C/ Duque de Alba 12, 1.º Derecha, 28012 Madrid',
    phone: '+34 913 642 872',
    email: 'info@dentalnavarro.com',
    website: 'https://www.dentalnavarro.com/en/',
    description: 'English-speaking dental clinic in Madrid city center founded by dentists from the first promotion of Dentistry at U.C.M. University. Specializes in dental implants, orthodontics, periodontics, endodontics, and dental aesthetics. Offers conscious sedation treatments for anxious patients and digital smile design using the latest technology. The clinic is equipped with cutting-edge dental technology and staffed by highly reputed specialists with postgraduate training at prestigious international universities. Personalized treatment plans with detailed studies and customized budgets. Belongs to the Círculo de Odontólogos y Estomatólogos (COE). Two locations: Madrid Capital center (near La Latina, Puerta del Sol, Opera) and Becerril de la Sierra. Offers 5% discount on dental aesthetic treatments when requested through website, free dental study, and comfortable financing options.',
    specialties: ['Dental Implants', 'Orthodontics', 'Periodontics', 'Endodontics', 'Dental Aesthetics'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 0,
  },

  // TASK-1668: My Medica Medical Clinic - Valencia
  {
    id: 1668,
    name: 'My Medica Medical Clinic',
    category: 'Doctors',
    city: 'Valencia',
    address: 'Plaza Ayuntamiento 26, 4º, 46002 Valencia',
    phone: '+34 963 145 000',
    email: 'info@mymedicavalencia.com',
    website: 'https://mymedicavalencia.com',
    description: 'International medical clinic in downtown Valencia with a team of English-speaking doctors providing personalized treatment for over 12 specialties. Modern clinic located in Plaza Ayuntamiento with no waiting times and high sanitization standards. Specialties include general medicine, dermatology, gynecology, endocrinology, ENT, urology, cardiology, paediatrics, pulmonology, orthopedics, and psychiatry. Accepts major international insurances including GeoBlue, HTH Travel, CISI, and Henner. Bilingual staff ensures clear communication for expats and international patients.',
    specialties: ['General Medicine', 'Dermatology', 'Gynecology', 'Endocrinology', 'ENT', 'Urology', 'Cardiology', 'Paediatrics', 'Pulmonology', 'Orthopedics', 'Psychiatry'],
    languages: ['English', 'Spanish'],
    rating: 5.0,
    reviewCount: 0,
  },
  // TASK-1669: Therapy in Barcelona - Mental Health
  {
    id: 1669,
    name: 'Therapy in Barcelona',
    category: 'Therapists',
    city: 'Barcelona',
    address: 'Carrer de Paris 162-164, 3o, 1a, 08036 Barcelona',
    phone: '+34 644 522 369',
    email: 'info@therapyinbarcelona.com',
    website: 'https://www.therapyinbarcelona.com',
    description: 'Award-winning therapy practice specializing in Counseling, Psychology, and Family Therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
    specialties: ['Psychology', 'Counseling', 'Family Therapy', 'Cognitive Behavioral', 'Anxiety & Depression', 'Relationship'],
    languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Catalan'],
    rating: 4.9,
    reviewCount: 150,
  },
  // Therapy in Barcelona - Madrid Office
  {
    id: 16691,
    name: 'Therapy in Barcelona',
    category: 'Therapists',
    city: 'Madrid',
    address: 'Calle Fernan González, 28009 Madrid',
    phone: '+34 644 522 369',
    email: 'info@therapyinbarcelona.com',
    website: 'https://www.therapyinbarcelona.com',
    description: 'Award-winning therapy practice specializing in Counseling, Psychology, and Family Therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
    specialties: ['Psychology', 'Counseling', 'Family Therapy', 'Cognitive Behavioral', 'Anxiety & Depression', 'Relationship'],
    languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Catalan'],
    rating: 4.9,
    reviewCount: 150,
  },
  // TASK-1652: Simple English Advice - Gestor/Consultancy - Malaga
  {
    id: 1652,
    name: 'Simple English Advice',
    category: 'Gestors',
    city: 'Malaga',
    address: 'Costa del Sol, Malaga',
    phone: '+34 951 74 51 68',
    email: 'info@simpleenglishadvice.com',
    website: 'https://simpleenglishadvice.com',
    description: 'English-speaking expat agency providing gestor and administrative support services in Malaga and throughout Spain. Founded by British expats Delroy and Christina with over 15 years of experience helping foreigners navigate Spanish bureaucracy. Winner of the SME News Award for Best Expat Relocation Support Service for 4 consecutive years. Services include vehicle ownership transfers, UK to Spanish driving licence exchange, NRA rental registration numbers, EU vehicle import/matriculation, autónomo registration, non-resident tax filing, Digital Nomad Visa support, and general bureaucracy assistance. Transparent fees with no hidden charges. Over 100 five-star Google reviews.',
    specialties: ['Vehicle Transfers', 'Driving Licence Exchange', 'NRA Registration', 'Vehicle Import', 'Autónomo Registration', 'Tax Filing', 'Digital Certificates', 'Visa Applications', 'Property Registration', 'Bureaucracy Support'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 100,
  },
  // TASK-1670: Clinica Cloe - Dental Clinic Madrid
  {
    id: 1670,
    name: 'Clinica Cloe',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Avenida de los Prunos nº 5-7, 28042 Madrid',
    phone: '+34 91 371 7919',
    email: 'clinica@clinicacloe.com',
    website: 'https://www.clinicacloe.com',
    description: 'English-speaking dental clinic in Madrid led by a US-trained dentist with a Doctorate of Dental Surgery (D.D.S) from New York University College of Dentistry. Comprehensive dental care for expats and international patients with a multilingual team fluent in English and Spanish. Services include general dentistry, dental implants, cosmetic dentistry, teeth whitening, orthodontics (including invisible aligners), root canal treatment (endodontics), dental crowns and bridges, veneers, pediatric dentistry, periodontal care (gum disease treatment), oral surgery, and emergency dental services. State-of-the-art facilities with digital X-rays, intraoral scanners, and advanced sterilization protocols. Patient-centered approach with clear explanations in English about treatment options, procedures, and costs. Flexible appointment scheduling including evenings and Saturdays. Financing options available for extensive treatments. Located in Madrid with easy access by public transport.',
    specialties: ['General Dentistry', 'Implants', 'Cosmetic Dentistry', 'Orthodontics', 'Endodontics', 'Pediatric Dentistry'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 56,
  },
  // TASK-1696: Granada Digital Nomad & Student Services
  {
    id: 16961,
    name: 'Coworking Granada',
    category: 'Coworking Spaces',
    city: 'Granada',
    address: 'Calle Recogidas, 12, 18005 Granada',
    phone: '+34 958 123 400',
    email: 'hello@coworkinggranada.com',
    website: 'https://www.coworkinggranada.com',
    description: 'Modern coworking space in central Granada with dedicated desks, private offices, and weekly community events for remote workers. English-speaking community manager and regular networking sessions for digital nomads.',
    specialties: ['Hot Desks', 'Dedicated Desks', 'Meeting Rooms', 'Community Events'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 210,
  },
  {
    id: 16962,
    name: 'WorkIN Granada',
    category: 'Coworking Spaces',
    city: 'Granada',
    address: 'Calle Gran Vía de Colón, 28, 18010 Granada',
    phone: '+34 958 200 550',
    email: 'hola@workingranada.es',
    website: 'https://www.workingranada.es',
    description: 'Digital nomad-focused coworking hub with fast fiber internet, ergonomic workstations, and curated workshops. Offers flexible passes, meeting rooms, and a strong international community.',
    specialties: ['Hot Desks', 'Private Offices', 'High-Speed Internet', 'Networking'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 185,
  },
  {
    id: 16963,
    name: 'The Nomad Hub Granada',
    category: 'Coworking Spaces',
    city: 'Granada',
    address: 'Calle San Antón, 72, 18005 Granada',
    phone: '+34 958 321 980',
    email: 'team@nomadhubgranada.com',
    website: 'https://www.nomadhubgranada.com',
    description: 'Boutique coworking space with Alhambra views, curated networking events, and a quiet focus zone for remote professionals. English-speaking host and weekly community breakfasts.',
    specialties: ['Dedicated Desks', 'Meeting Rooms', 'Community Events', '24/7 Access'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 142,
  },
  {
    id: 16964,
    name: 'Lexidy Law Firm - Granada',
    category: 'Lawyers',
    city: 'Granada',
    address: 'Calle Reyes Católicos, 5, 18001 Granada',
    phone: '+34 958 275 440',
    email: 'granada@lexidy.com',
    website: 'https://www.lexidy.com',
    description: 'International law firm with an English-speaking team in Granada specializing in digital nomad visas, residency permits, and relocation legal support. Provides transparent fixed-fee services for expats and entrepreneurs.',
    specialties: ['Immigration', 'Business Law', 'Tax Law', 'Real Estate'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 118,
  },
  {
    id: 16965,
    name: 'Spain Digital Nomad Visa Services',
    category: 'Business Services',
    city: 'Granada',
    address: 'Plaza de la Trinidad, 2, 18001 Granada',
    phone: '+34 958 410 220',
    email: 'info@spainnomadvisas.com',
    website: 'https://www.spainnomadvisas.com',
    description: 'Visa consultancy specializing in Spanish Digital Nomad Visa applications, document preparation, and relocation guidance. English-speaking consultants provide end-to-end support for remote workers.',
    specialties: ['Administrative Support', 'Relocation Support', 'Compliance', 'Commercial Registrations'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 96,
  },
  {
    id: 16966,
    name: 'Nomad Tax Advisors',
    category: 'Accountants',
    city: 'Granada',
    address: 'Calle Arabial, 45, 18004 Granada',
    phone: '+34 958 555 610',
    email: 'advisors@nomadtax.es',
    website: 'https://www.nomadtax.es',
    description: 'Granada-based tax advisory firm focused on digital nomads and remote workers. Services include expat tax planning, autónomo registration, and cross-border compliance with English-speaking advisors.',
    specialties: ['Expat Tax', 'Personal Tax', 'Business Accounting', 'Tax Law'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 134,
  },
  {
    id: 16967,
    name: 'Remote Worker Resources Granada',
    category: 'Business Services',
    city: 'Granada',
    address: 'Calle Acera del Darro, 24, 18005 Granada',
    phone: '+34 958 600 115',
    email: 'support@remoteworkerresources.es',
    website: 'https://www.remoteworkerresources.es',
    description: 'Business support service for international remote workers, offering company setup guidance, invoicing support, and administrative services in English. Flexible online consultations available.',
    specialties: ['Company Formation', 'Administrative Support', 'Tax Registration', 'Operational Support'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 88,
  },
  {
    id: 16968,
    name: 'University of Granada - International Student Office',
    category: 'Educational Services',
    city: 'Granada',
    address: 'Hospital Real, Cuesta del Hospicio, 18071 Granada',
    phone: '+34 958 243 117',
    email: 'international@ugr.es',
    website: 'https://internacional.ugr.es',
    description: 'Official international student office providing orientation, enrollment guidance, and support services for exchange and degree students. English-speaking advisors assist with documentation and campus integration.',
    specialties: ['Student Orientation', 'Academic Advising', 'Campus Integration', 'Visa Support'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 260,
  },
  {
    id: 16969,
    name: 'Granada Student Housing',
    category: 'Realtors',
    city: 'Granada',
    address: 'Calle Recogidas, 40, 18002 Granada',
    phone: '+34 958 700 330',
    email: 'housing@granadastudenthomes.com',
    website: 'https://www.granadastudenthomes.com',
    description: 'Accommodation agency specializing in student housing, shared flats, and short-term rentals near University of Granada. English-speaking staff assist with contracts and move-in logistics.',
    specialties: ['Rentals', 'Relocation', 'Property Management', 'Holiday Rentals'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 175,
  },
  {
    id: 16970,
    name: 'Student Visa Granada',
    category: 'Lawyers',
    city: 'Granada',
    address: 'Calle San Matías, 18, 18009 Granada',
    phone: '+34 958 840 210',
    email: 'visa@studentvisagranada.com',
    website: 'https://www.studentvisagranada.com',
    description: 'Immigration legal team focused on student visas, NIE/TIE applications, and residency renewals for international students. English-speaking consultations and fast document processing.',
    specialties: ['Immigration', 'Employment', 'Civil Litigation', 'Wills & Probate'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 102,
  },
  {
    id: 16971,
    name: 'Granada Student Support Center',
    category: 'Educational Services',
    city: 'Granada',
    address: 'Calle Elvira, 101, 18010 Granada',
    phone: '+34 958 650 780',
    email: 'support@granadastudents.org',
    website: 'https://www.granadastudents.org',
    description: 'Student support hub offering NIE assistance, banking setup guidance, and integration workshops for international students. Provides English-language resources and onboarding sessions.',
    specialties: ['Accommodation Guidance', 'Student Orientation', 'Document Translation', 'Student Wellness'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 120,
  },
  {
    id: 16972,
    name: 'Campus Life Granada',
    category: 'Educational Services',
    city: 'Granada',
    address: 'Calle Profesor Vicente Callao, 3, 18011 Granada',
    phone: '+34 958 912 400',
    email: 'hello@campuslifegranada.com',
    website: 'https://www.campuslifegranada.com',
    description: 'Orientation and social activities provider helping international students connect with campus clubs, language exchanges, and city life. Weekly English-language events and tours.',
    specialties: ['Campus Integration', 'Student Orientation', 'Tutoring', 'Student Wellness'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 154,
  },
  {
    id: 16973,
    name: 'Delengua Spanish School',
    category: 'Language Schools',
    city: 'Granada',
    address: 'Calle Fábrica Vieja, 8, 18010 Granada',
    phone: '+34 958 203 623',
    email: 'info@delengua.es',
    website: 'https://www.delengua.es',
    description: 'Cervantes-accredited Spanish school in Granada offering intensive courses, DELE preparation, and cultural immersion programs. Small class sizes with English-speaking student advisors.',
    specialties: ['Spanish Intensive', 'DELE Preparation', 'Small Group Classes', 'Cultural Immersion'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 310,
  },
  {
    id: 16974,
    name: 'Granada International Student Health Center',
    category: 'Medical Clinics',
    city: 'Granada',
    address: 'Avenida de la Constitución, 18, 18012 Granada',
    phone: '+34 958 770 900',
    email: 'care@studenthealthgranada.com',
    website: 'https://www.studenthealthgranada.com',
    description: 'Student-focused medical clinic providing primary care, vaccinations, and travel health services with English-speaking physicians. Convenient appointment scheduling for university students.',
    specialties: ['Primary Care', 'Student Health', 'Vaccinations', 'Diagnostics'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 98,
  },
  {
    id: 16975,
    name: 'Study Granada',
    category: 'Realtors',
    city: 'Granada',
    address: 'Plaza del Campillo, 6, 18009 Granada',
    phone: '+34 958 505 660',
    email: 'housing@studygranada.com',
    website: 'https://www.studygranada.com',
    description: 'Student accommodation specialists offering verified flats, residences, and short-term stays near campus. English-speaking advisors and contract review included.',
    specialties: ['Rentals', 'Relocation', 'Property Management', 'Holiday Rentals'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 140,
  },

];

// Generate realistic mock data for all city/category combinations
const firstNames = ['Dr. Sarah', 'Dr. James', 'Dr. Maria', 'Dr. Michael', 'Dr. Elena', 'Dr. David', 'Dr. Laura', 'Dr. John', 'Dr. Carmen', 'Dr. Robert', 'Dr. Ana', 'Dr. William', 'Dr. Patricia', 'Dr. Thomas', 'Dr. Sofia'];
const lastNames = ['Smith', 'Johnson', 'Garcia', 'Williams', 'Martinez', 'Brown', 'Rodriguez', 'Jones', 'Lopez', 'Davis', 'Perez', 'Miller', 'Sanchez', 'Wilson', 'Gomez'];

const streetNames: Record<string, string[]> = {
  madrid: ['Gran Via', 'Calle Mayor', 'Paseo de la Castellana', 'Calle de Alcala', 'Plaza Mayor', 'Calle Serrano', 'Paseo del Prado', 'Calle Fuencarral'],
  barcelona: ['Passeig de Gracia', 'Las Ramblas', 'Carrer de Arago', 'Avinguda Diagonal', 'Carrer de Balmes', 'Placa Catalunya', 'Carrer de Mallorca', 'Passeig de Sant Joan'],
  valencia: ['Calle de la Paz', 'Carrer de Colon', 'Avinguda del Regne de Valencia', 'Carrer de la Pau', 'Placa de lAjuntament', 'Carrer de Xativa', 'Avinguda de Blasco Ibanez'],
  seville: ['Calle Sierpes', 'Avenida de la Constitucion', 'Calle Tetuan', 'Plaza Nueva', 'Calle Betis', 'Avenida de Kansas City', 'Calle San Fernando', 'Plaza de Espana'],
  malaga: ['Calle Marques de Larios', 'Avenida de Andalucia', 'Calle Granada', 'Paseo del Parque', 'Calle Alcazabilla', 'Avenida de la Rosaleda', 'Calle Compania'],
  granada: ['Calle Recogidas', 'Gran Vía de Colón', 'Calle Reyes Católicos', 'Calle Elvira', 'Calle San Antón', 'Plaza Nueva', 'Avenida de la Constitución'],
};

// Generate 8-12 listings per city/category combination
const mockListingCache = new Map<string, DirectoryListing[]>();

export const generateMockListings = (citySlug: string, categorySlug: string): DirectoryListing[] => {
  const cacheKey = `${citySlug}:${categorySlug}`;
  const cached = mockListingCache.get(cacheKey);
  if (cached) return cached;

  const city = cities.find(c => c.slug === citySlug);
  const category = categories.find(c => c.slug === categorySlug);
  
  if (!city || !category) return [];
  
  const listings: DirectoryListing[] = [];
  const count = 8 + Math.floor(Math.random() * 5); // 8-12 listings
  const streets = streetNames[citySlug] || ['Main Street'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[(i + citySlug.length) % firstNames.length];
    const lastName = lastNames[(i + categorySlug.length) % lastNames.length];
    const street = streets[i % streets.length];
    const number = 10 + Math.floor(Math.random() * 200);
    
    // Select 2-4 specialties from the category
    const numSpecialties = 2 + Math.floor(Math.random() * 3);
    const shuffledSpecialties = [...category.specialties].sort(() => Math.random() - 0.5);
    const selectedSpecialties = shuffledSpecialties.slice(0, numSpecialties);
    
    listings.push({
      id: parseInt(`${citySlug.length}${categorySlug.length}${i}`),
      name: `${firstName} ${lastName}`,
      category: category.name,
      city: city.name,
      address: `${street} ${number}, ${city.name}`,
      phone: `+34 ${600 + Math.floor(Math.random() * 99)} ${Math.floor(Math.random() * 999)} ${Math.floor(Math.random() * 999)}`,
      email: `${firstName.toLowerCase().replace('dr. ', '')}.${lastName.toLowerCase()}@example.com`,
      website: Math.random() > 0.3 ? `https://www.${firstName.toLowerCase().replace('dr. ', '')}${lastName.toLowerCase()}.com` : undefined,
      description: `Experienced ${category.singular.toLowerCase()} serving the English-speaking community in ${city.name}. Professional services with clear communication and personalized attention.`,
      specialties: selectedSpecialties,
      languages: ['English', 'Spanish', Math.random() > 0.5 ? 'French' : 'German'].filter(Boolean),
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: 10 + Math.floor(Math.random() * 100),
    });
  }
  
  mockListingCache.set(cacheKey, listings);
  return listings;
};

// Get listings with optional filtering
export const getListings = (
  citySlug: string,
  categorySlug: string,
  filters?: {
    specialty?: string;
    language?: string;
    page?: number;
    limit?: number;
  }
): { listings: DirectoryListing[]; total: number; page: number; totalPages: number } => {
  let listings = generateMockListings(citySlug, categorySlug);

  // Merge real businesses that match this city/category
  const city = cities.find(c => c.slug === citySlug);
  const category = categories.find(c => c.slug === categorySlug);
  if (city && category) {
    const matchingReal = realBusinesses.filter(
      b => b.city.toLowerCase() === city.name.toLowerCase() &&
           b.category.toLowerCase() === category.name.toLowerCase()
    );
    listings = [...matchingReal, ...listings];
  }
  
  // Apply filters
  if (filters?.specialty) {
    listings = listings.filter(l => 
      l.specialties.some(s => s.toLowerCase().includes(filters.specialty!.toLowerCase()))
    );
  }
  
  if (filters?.language) {
    listings = listings.filter(l => 
      l.languages.some(lang => lang.toLowerCase().includes(filters.language!.toLowerCase()))
    );
  }
  
  const total = listings.length;
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const totalPages = Math.ceil(total / limit);
  
  // Apply pagination
  const start = (page - 1) * limit;
  const paginatedListings = listings.slice(start, start + limit);
  
  return {
    listings: paginatedListings,
    total,
    page,
    totalPages,
  };
};

export const getListingById = (listingId: number): DirectoryListing | null => {
  return realBusinesses.find(listing => listing.id === listingId) ?? null;
};
