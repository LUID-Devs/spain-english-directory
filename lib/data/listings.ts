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
    description: 'International medical clinic in downtown Valencia with a team of English-speaking doctors providing personalized treatment for over 12 specialties. Modern clinic located in Plaza Ayuntamiento with no waiting times and high sanitization standards. Specialties include general medicine, dermatology, gynecology, endocrinology, ENT, urology, cardiology, paediatrics, pulmonology, orthopedics, psychiatry, and ultrasound services. Accepts major international insurances including GeoBlue, HTH Travel, CISI, and Henner. Bilingual staff ensures clear communication for expats and international patients.',
    specialties: ['General Medicine', 'Dermatology', 'Gynecology', 'Cardiology', 'Pediatrics', 'Orthopedics'],
    languages: ['English', 'Spanish'],
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
