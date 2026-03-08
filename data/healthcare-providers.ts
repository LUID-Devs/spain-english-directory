// TASK-1668: Healthcare Providers - Valencia
// My Medica Medical Clinic - English-speaking medical clinic in Valencia

export interface HealthcareProvider {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website: string;
  speaksEnglish: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  isClaimed: boolean;
}

export const healthcareProviders: HealthcareProvider[] = [
  {
    id: 1668,
    name: 'My Medica Medical Clinic',
    category: 'Doctors',
    description: 'International medical clinic in downtown Valencia with a team of English-speaking doctors providing personalized treatment for over 12 specialties. Modern clinic located in Plaza Ayuntamiento with no waiting times and high sanitization standards. Specialties include general medicine, dermatology, gynecology, endocrinology, ENT, urology, cardiology, paediatrics, pulmonology, orthopedics, psychiatry, and ultrasound services. Accepts major international insurances including GeoBlue, HTH Travel, CISI, and Henner. Bilingual staff ensures clear communication for expats and international patients.',
    address: 'Plaza Ayuntamiento 26, 4º, 46002 Valencia',
    city: 'Valencia',
    province: 'Valencia',
    phone: '+34 963 145 000',
    email: 'info@mymedicavalencia.com',
    website: 'https://mymedicavalencia.com',
    speaksEnglish: true,
    isFeatured: true,
    isVerified: true,
    isClaimed: false,
  },
];

export default healthcareProviders;
