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
  // TASK-1689: Costa del Sol Dental Tourism Clinics
  {
    id: 16891,
    name: 'Crooke & Laguna Dental Clinic',
    category: 'Dentists',
    city: 'Marbella',
    address: 'Calle Camilo José Cela, 6, 29602 Marbella',
    phone: '+34 952 864 848',
    email: 'info@crookelaguna.com',
    website: 'https://www.crookelaguna.com',
    description: 'Expert dental clinic in Marbella specializing in dental implants and cosmetic dentistry for international patients. Founded by Dr. Eduardo Crooke and Dr. Javier Laguna, both certified in Spain and the UK. Leading destination for dental tourism on the Costa del Sol with English-speaking staff throughout.',
    specialties: ['Dental Implants', 'Cosmetic Dentistry', 'Orthodontics', 'Emergency Dentistry'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 180,
  },
  {
    id: 16892,
    name: 'Dental Care Marbella',
    category: 'Dentists',
    city: 'Marbella',
    address: 'Av. Ricardo Soriano, 17, 29601 Marbella',
    phone: '+34 952 775 500',
    email: 'info@dentalcaremarbella.com',
    website: 'https://www.dentalcaremarbella.com',
    description: 'Boutique dental clinic in Marbella offering personalized dental care for English-speaking residents and visitors. UK-trained dentist with extensive experience treating international patients.',
    specialties: ['General Dentistry', 'Cosmetic Dentistry', 'Dental Implants', 'Orthodontics'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 95,
  },
  {
    id: 16893,
    name: 'Malaga Dental Clinic',
    category: 'Dentists',
    city: 'Malaga',
    address: 'Calle Marqués de Larios, 3, 29005 Málaga',
    phone: '+34 951 200 200',
    email: 'info@malagadentalclinic.com',
    website: 'https://www.malagadentalclinic.com',
    description: 'Modern dental clinic in central Málaga providing comprehensive dental services for the international community. English-speaking team with international training.',
    specialties: ['General Dentistry', 'Cosmetic Dentistry', 'Dental Implants', 'Orthodontics'],
    languages: ['English', 'Spanish', 'German', 'French'],
    rating: 4.7,
    reviewCount: 120,
  },
  {
    id: 16894,
    name: 'British Dental Clinic Costa del Sol',
    category: 'Dentists',
    city: 'Fuengirola',
    address: 'Calle de la Cruz, 12, 29640 Fuengirola',
    phone: '+34 952 467 500',
    email: 'info@britishdentalcostadelsol.com',
    website: 'https://www.britishdentalcostadelsol.com',
    description: 'UK-standard dental clinic in Fuengirola serving the British and international community on the Costa del Sol. GDC registered dentists maintaining UK practice standards.',
    specialties: ['General Dentistry', 'Dental Implants', 'Cosmetic Dentistry', 'Emergency Dentistry'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 150,
  },
  {
    id: 16895,
    name: 'Marbella Dental Center',
    category: 'Dentists',
    city: 'Marbella',
    address: 'Calle José Meliá, 2, Edificio Marbella Center, 29602 Marbella',
    phone: '+34 952 825 400',
    email: 'contact@marbelladentalcenter.com',
    website: 'https://www.marbelladentalcenter.com',
    description: 'Full-service dental implant center in Marbella specializing in complex dental rehabilitation for international patients. Advanced technology including 3D CT scanner.',
    specialties: ['Dental Implants', 'Oral Surgery', 'Cosmetic Dentistry', 'Sedation Dentistry'],
    languages: ['English', 'Spanish', 'German'],
    rating: 4.9,
    reviewCount: 200,
  },
  {
    id: 16896,
    name: 'Smiles Dental Clinic Marbella',
    category: 'Dentists',
    city: 'Marbella',
    address: 'Calle Gregorio Marañón, 4, 29601 Marbella',
    phone: '+34 952 828 800',
    email: 'info@smilesmarbella.com',
    website: 'https://www.smilesmarbella.com',
    description: 'Family-friendly dental clinic in Marbella offering comprehensive care for patients of all ages. Emphasis on preventive dentistry with English-speaking staff.',
    specialties: ['General Dentistry', 'Pediatric Dentistry', 'Orthodontics', 'Cosmetic Dentistry'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 85,
  },
  {
    id: 16897,
    name: 'Costa Dental Fuengirola',
    category: 'Dentists',
    city: 'Fuengirola',
    address: 'Paseo Marítimo Rey de España, 61, 29640 Fuengirola',
    phone: '+34 952 585 858',
    email: 'costadental@hotmail.com',
    description: 'Beachfront dental clinic in Fuengirola providing quality dental care for expats and tourists on the Costa del Sol. Competitive prices for dental tourism.',
    specialties: ['General Dentistry', 'Cosmetic Dentistry', 'Dental Implants', 'Orthodontics'],
    languages: ['English', 'Spanish'],
    rating: 4.5,
    reviewCount: 70,
  },
  {
    id: 16898,
    name: 'Elite Dental Marbella',
    category: 'Dentists',
    city: 'Marbella',
    address: 'Muelle Ribera, Casa D, Local 6, Puerto Banús, 29660 Marbella',
    phone: '+34 951 204 000',
    email: 'info@elitedentalmarbella.com',
    website: 'https://www.elitedentalmarbella.com',
    description: 'Cosmetic dental boutique in Puerto Banús, Marbella specializing in smile transformations for discerning international clients. Luxury amenities and concierge service.',
    specialties: ['Cosmetic Dentistry', 'Dental Implants', 'Orthodontics', 'Teeth Whitening'],
    languages: ['English', 'Spanish', 'Russian'],
    rating: 4.9,
    reviewCount: 110,
  },
  {
    id: 16899,
    name: 'Clinica Dental Fuengirola',
    category: 'Dentists',
    city: 'Fuengirola',
    address: 'Calle Jacinto Benavente, 12, 29640 Fuengirola',
    phone: '+34 952 475 900',
    email: 'clinicadentalfuengirola@gmail.com',
    description: 'Established dental practice in central Fuengirola serving the local and international community for over 15 years. English-speaking team with honest advice and fair pricing.',
    specialties: ['General Dentistry', 'Dental Implants', 'Cosmetic Dentistry', 'Endodontics'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 65,
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
