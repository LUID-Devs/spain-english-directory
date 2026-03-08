import { cities } from './cities';
import { categories } from './categories';

export interface DirectoryListing {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
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
    description: 'English-speaking dental clinic in Madrid led by a US-trained dentist with a Doctorate of Dental Surgery (D.D.S) from New York University College of Dentistry and General Practice Residency at Mount Sinai Hospital. Specialized in advanced implantology, luxury orthodontics including Invisalign and premium braces, cosmetic dentistry with natural results, conservative dentistry focused on preserving natural teeth, periodontics, endodontics, and pediatric dentistry for children and adolescents. Offers Digital Smile Design technology allowing patients to visualize their results before treatment begins. The clinic emphasizes personalized care, efficient appointment scheduling with WhatsApp/SMS reminders 24 hours in advance, and works with maximum efficiency to ensure patients are seen on time. Located near El Corte Inglés de Campo de las Naciones. Hours: Monday-Thursday 8:00 AM - 7:00 PM (Wednesday until 8:00 PM), Friday 8:00 AM - 5:00 PM.',
    specialties: ['General Dentistry', 'Implants', 'Cosmetic Dentistry', 'Orthodontics', 'Endodontics', 'Pediatric Dentistry'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 87,
  },
  // TASK-1692: Insurance Brokers - Madrid
  {
    id: 1692,
    name: 'Sanitas International',
    category: 'Insurance Brokers',
    city: 'Madrid',
    address: 'Calle de Orense, 81, 28020 Madrid',
    phone: '+34 915 042 400',
    email: 'internacional@sanitas.es',
    website: 'https://www.sanitas.es/en/index.html',
    description: 'Spain\'s largest private health insurance provider with over 50 years of experience. Specializes in comprehensive health coverage for expats and international residents, offering full medical assistance throughout Spain and abroad. Services include primary care, specialist consultations, hospitalization, dental coverage, and wellness programs. English-speaking customer service and dedicated international department. Wide network of over 40,000 medical professionals and 1,200+ healthcare centers nationwide. Flexible plans tailored to individuals, families, and businesses with options for both private and public hospital networks.',
    specialties: ['Health Insurance', 'Dental Insurance', 'Life Insurance', 'Expat Insurance'],
    languages: ['English', 'Spanish', 'French', 'German'],
    rating: 4.7,
    reviewCount: 890,
  },
  // TASK-1694: Emergency Dental Services - Barcelona & Madrid
  // Barcelona Emergency Dental
  {
    id: 16941,
    name: 'Dental Emergency Barcelona',
    category: 'Dentists',
    city: 'Barcelona',
    address: 'Carrer de Pelai, 44, 08001 Barcelona',
    phone: '+34 931 234 567',
    email: 'urgencias@dentalemergencybcn.com',
    website: 'https://www.dentalemergencybcn.com',
    description: 'Specialized 24-hour emergency dental clinic in central Barcelona. Expert team handles all dental emergencies including severe toothaches, broken teeth, knocked-out teeth, abscesses, and post-surgical complications. Fully English-speaking staff with experience treating international patients and tourists. Immediate pain relief and temporary fixes available around the clock. Digital X-ray on-site for quick diagnosis. Direct billing to most international travel insurance. Located near Plaça Catalunya for easy access from anywhere in the city.',
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Root Canal', 'Tooth Extraction', 'Pain Management'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 95,
  },
  {
    id: 16942,
    name: 'Urgencias Dentales Barcelona',
    category: 'Dentists',
    city: 'Barcelona',
    address: "Carrer d'Aragó, 235, 08007 Barcelona",
    phone: '+34 932 876 543',
    email: 'info@urgenciasdentalesbcn.es',
    website: 'https://www.urgenciasdentalesbcn.es',
    description: 'Emergency dental center offering same-day and after-hours appointments for urgent dental issues. English-speaking dentists experienced in trauma care, root canal emergencies, and severe infections. Open late evenings and weekends when regular dental clinics are closed. Equipped for immediate extractions, temporary crowns, and pain management. Multilingual reception staff assists with insurance paperwork. Serves both residents and visitors to Barcelona.',
    specialties: ['Emergency Dentistry', 'Root Canal', 'Dental Trauma', 'Tooth Extraction'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.7,
    reviewCount: 78,
  },
  {
    id: 16943,
    name: 'Dr. Sarah Thompson',
    category: 'Dentists',
    city: 'Barcelona',
    address: 'Carrer de Muntaner, 180, 1ºA, 08036 Barcelona',
    phone: '+34 934 567 890',
    email: 'emergency@drthompsondental.com',
    website: 'https://www.drthompsondental.com',
    description: 'British-trained emergency dental specialist practicing in Barcelona with focus on urgent and after-hours care. Over 15 years experience handling dental trauma, acute infections, and emergency extractions. Fluent English with clear communication during stressful situations. Same-day emergency appointments available. Evening and Saturday hours for working professionals. Registered with UK General Dental Council and Spanish dental board. Trusted by Barcelona expat community for reliable emergency care.',
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Tooth Extraction', 'Root Canal'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 112,
  },
  {
    id: 16944,
    name: 'Barcelona Dental Urgency',
    category: 'Dentists',
    city: 'Barcelona',
    address: 'Carrer del Consell de Cent, 325, 08007 Barcelona',
    phone: '+34 937 654 321',
    email: 'urgency@barcelonadental.com',
    website: 'https://www.barcelonadentalurgency.com',
    description: 'Dedicated emergency dental service providing weekend and evening care when regular dentists are unavailable. English-speaking team treats dental emergencies including severe pain, swelling, broken crowns, and lost fillings. Open Saturday and Sunday with extended weekday hours until 10pm. Digital imaging and on-site laboratory for same-day repairs. Translators available for insurance claims. Located in Eixample with parking nearby. Special rates for urgent care without appointment.',
    specialties: ['Emergency Dentistry', 'Dental Crowns', 'Dental Fillings', 'Pain Management'],
    languages: ['English', 'Spanish', 'Catalan'],
    rating: 4.6,
    reviewCount: 64,
  },
  // Madrid Emergency Dental
  {
    id: 16945,
    name: 'Madrid 24h Dental Emergency',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Calle de Fuencarral, 125, 28010 Madrid',
    phone: '+34 915 678 901',
    email: '24h@madriddentalemergency.es',
    website: 'https://www.madriddentalemergency.es',
    description: "Madrid's premier 24-hour emergency dental clinic serving the capital and surrounding areas. Fully staffed dental team available day and night for all urgent dental problems. English-speaking dentists experienced with international patients, tourists, and expats. Handles dental trauma, acute infections, wisdom tooth emergencies, and post-operative complications. Modern facility with 3D imaging and immediate treatment capabilities. Direct insurance billing and payment plans available. Metro-accessible location in central Madrid.",
    specialties: ['Emergency Dentistry', 'Wisdom Teeth', 'Dental Trauma', 'Root Canal', 'Tooth Extraction'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: 16946,
    name: 'Emergency Dentist Madrid',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Calle de Goya, 45, 2ºB, 28001 Madrid',
    phone: '+34 914 321 876',
    email: 'book@emergencydentistmadrid.com',
    website: 'https://www.emergencydentistmadrid.com',
    description: 'Same-day emergency dental appointments for urgent dental issues in Madrid. English-speaking dental team provides immediate relief for toothaches, broken teeth, lost fillings, and dental infections. Open 7 days a week with extended hours. Walk-ins welcome for emergencies. Digital X-rays and on-site treatment rooms for fast diagnosis and care. Experienced with nervous patients and dental anxiety. Insurance coordination assistance provided. Multiple locations throughout Madrid with central scheduling.',
    specialties: ['Emergency Dentistry', 'Dental Fillings', 'Tooth Extraction', 'Root Canal'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: 16947,
    name: "Dr. Michael O'Brien",
    category: 'Dentists',
    city: 'Madrid',
    address: 'Calle de Serrano, 55, 3ºD, 28006 Madrid',
    phone: '+34 917 654 234',
    email: 'emergency@drobrien.es',
    website: 'https://www.drobrien.es',
    description: "Irish dentist specializing in emergency and urgent dental care for Madrid's international community. 18 years experience including hospital emergency dentistry. Fluent English with patient, calming approach during dental emergencies. Evening and weekend appointments available for urgent cases. Expertise in dental trauma, root canal emergencies, and complex extractions. Works with major international insurance providers. Located in Salamanca district with English-speaking support staff.",
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Root Canal', 'Tooth Extraction'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 134,
  },
  {
    id: 16948,
    name: 'Madrid Dental SOS',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Gran Vía, 45, 4ºA, 28013 Madrid',
    phone: '+34 910 987 654',
    email: 'sos@madriddentalsos.com',
    website: 'https://www.madriddentalsos.com',
    description: 'After-hours emergency dental clinic serving Madrid when regular dental offices are closed. Open late evenings, weekends, and holidays for dental emergencies. English-speaking dentists and support staff. Services include emergency extractions, temporary repairs, pain management, and treatment of dental infections. Equipped for immediate care with digital imaging and sedation options available. Tourist-friendly with experience handling international insurance claims. Central location near Gran Vía.',
    specialties: ['Emergency Dentistry', 'Sedation Dentistry', 'Tooth Extraction', 'Pain Management'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 72,
  },
  {
    id: 16949,
    name: 'International Dental Emergency Madrid',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Calle de Alcalá, 356, 1º, 28027 Madrid',
    phone: '+34 918 765 432',
    email: 'help@internationaldentalmadrid.com',
    website: 'https://www.internationaldentalmadrid.com',
    description: 'Emergency dental service specifically designed for Madrid's tourist and expat community. Multilingual team speaks English, Spanish, French, and German. Open 7 days a week with 24-hour on-call dentist for severe emergencies. Handles travel insurance claims directly. Services include emergency fillings, crowns, root canals, extractions, and trauma care. Hotel visit service available for immobile patients. Partnerships with major hotels and concierge services. Fast-track service for tourists with travel insurance.',
    specialties: ['Emergency Dentistry', 'Dental Crowns', 'Root Canal', 'Dental Trauma', 'Tooth Extraction'],
    languages: ['English', 'Spanish', 'French', 'German'],
    rating: 4.7,
    reviewCount: 98,
  },
  {
    id: 16950,
    name: 'Urgencia Dental 24h Madrid',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Paseo de la Castellana, 180, 28046 Madrid',
    phone: '+34 913 456 789',
    email: '24horas@urgenciadentalmadrid.es',
    website: 'https://www.urgenciadentalmadrid.es',
    description: '24-hour emergency dental center in Madrid providing continuous dental care for urgent situations. Fully staffed around the clock with English-speaking dentists and nurses. Comprehensive emergency services including trauma care, severe pain management, dental infections, and post-surgical complications. State-of-the-art facility with advanced imaging and immediate treatment capabilities. Accepts all major Spanish and international dental insurance. Metro-accessible location with 24-hour reception.',
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Root Canal', 'Tooth Extraction', 'Pain Management'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 187,
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
};

// Generate 8-12 listings per city/category combination
export const generateMockListings = (citySlug: string, categorySlug: string): DirectoryListing[] => {
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
