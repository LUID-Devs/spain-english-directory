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
    specialties: ['General Medicine', 'Dermatology', 'Gynecology', 'Endocrinology', 'ENT', 'Urology', 'Cardiology', 'Paediatrics', 'Pulmonology', 'Orthopedics', 'Psychiatry', 'Ultrasound'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 85,
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
    description: 'Award-winning therapy practice specializing in counseling and therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
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
    description: 'Award-winning therapy practice specializing in counseling and therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
    specialties: ['Psychology', 'Counseling', 'Family Therapy', 'Cognitive Behavioral', 'Anxiety & Depression', 'Relationship'],
    languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Catalan'],
    rating: 4.9,
    reviewCount: 150,
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
  // TASK-1692: Adeslas - Madrid
  {
    id: 1693,
    name: 'Adeslas (SegurCaixa Adeslas)',
    category: 'Insurance Brokers',
    city: 'Madrid',
    address: 'Calle de Sagasta, 18, 28004 Madrid',
    phone: '+34 915 666 000',
    email: 'clientes@adeslas.es',
    website: 'https://www.segurcaixaadeslas.es/en',
    description: 'Leading Spanish health insurance company backed by Mutua Madrileña and VidaCaixa. Over 50 years serving the Spanish market with comprehensive health, dental, and life insurance products. Extensive network of 45,000+ medical professionals and 1,150+ healthcare centers across Spain. English-speaking support for international clients. Offers specialist expat health insurance plans with full coverage including medical consultations, diagnostic tests, hospitalization, surgeries, and emergency care. Digital health services including video consultations and mobile app for easy claims and appointment booking.',
    specialties: ['Health Insurance', 'Dental Insurance', 'Life Insurance', 'Home Insurance'],
    languages: ['English', 'Spanish', 'Catalan'],
    rating: 4.6,
    reviewCount: 750,
  },
  // TASK-1692: DKV Seguros - Barcelona
  {
    id: 1694,
    name: 'DKV Seguros Barcelona',
    category: 'Insurance Brokers',
    city: 'Barcelona',
    address: 'Avinguda Diagonal, 543, 08029 Barcelona',
    phone: '+34 934 946 000',
    email: 'info@dkv.es',
    website: 'https://www.dkvseguros.com/en/',
    description: 'DKV is one of Spain\'s premier health insurance providers with a strong commitment to international clients. Part of the Munich Re Group, offering stability and extensive coverage. Specialized expat plans with full English-language support from enrollment to claims. Access to over 40,000 healthcare professionals and 1,000+ medical centers throughout Spain. Unique DKV Club Salud and Wellbeing program included with most policies. Premium plans offer international coverage for travel and extended stays outside Spain. 24/7 medical video consultation service and digital health platform.',
    specialties: ['Health Insurance', 'Life Insurance', 'Dental Insurance', 'Expat Insurance'],
    languages: ['English', 'Spanish', 'Catalan', 'German'],
    rating: 4.8,
    reviewCount: 620,
  },
  // TASK-1692: Cigna Global - Barcelona
  {
    id: 1695,
    name: 'Cigna Global Health Insurance',
    category: 'Insurance Brokers',
    city: 'Barcelona',
    address: 'Edificio Torre Mapfre, Carrer de la Marina, 16-18, 08005 Barcelona',
    phone: '+34 932 251 800',
    email: 'spain@cigna.com',
    website: 'https://www.cignaglobal.com',
    description: 'World-renowned international health insurance provider with over 200 years of experience. Cigna Global offers flexible health insurance plans specifically designed for expats living in Spain and globally mobile individuals. Coverage extends worldwide with options for Spain-only, Europe-wide, or full international protection. Access to over 1.5 million healthcare professionals and facilities globally. English-speaking customer service available 24/7/365. Comprehensive plans covering hospitalization, outpatient care, dental, vision, mental health, and maternity. Direct billing with major hospitals and clinics across Spain.',
    specialties: ['Health Insurance', 'Life Insurance', 'Dental Insurance', 'Travel Insurance'],
    languages: ['English', 'Spanish', 'Catalan', 'French', 'German', 'Dutch'],
    rating: 4.7,
    reviewCount: 540,
  },
  // TASK-1692: AXA Spain - Valencia
  {
    id: 1696,
    name: 'AXA Seguros Spain',
    category: 'Insurance Brokers',
    city: 'Valencia',
    address: 'Calle de Colón, 20, 46004 Valencia',
    phone: '+34 963 510 000',
    email: 'clientes@axa.es',
    website: 'https://www.axa.es',
    description: 'AXA is one of the world\'s largest insurance groups, operating in Spain with comprehensive health, life, home, and auto insurance products. AXA\'s health insurance for expats provides access to an extensive network of over 40,000 medical professionals across Spain. English-speaking customer service and claims handling. Flexible plans ranging from basic coverage to premium comprehensive protection including dental, optical, and preventive care. Global coverage options for international travel and repatriation. Digital tools including mobile app for policy management, claims submission, and virtual consultations. AXA Cuadro Médico app for finding healthcare providers.',
    specialties: ['Health Insurance', 'Home Insurance', 'Car Insurance', 'Life Insurance', 'Travel Insurance'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.5,
    reviewCount: 680,
  },
  // TASK-1692: Mapfre - Valencia
  {
    id: 1697,
    name: 'Mapfre Insurance',
    category: 'Insurance Brokers',
    city: 'Valencia',
    address: 'Carrer del Pintor Sorolla, 2, 46002 Valencia',
    phone: '+34 963 939 000',
    email: 'atencioncliente@mapfre.com',
    website: 'https://www.mapfre.com/en/',
    description: 'Mapfre is one of the largest insurance companies in Spain and Latin America, with a significant global presence. Over 85 years of experience providing comprehensive insurance solutions. Health insurance plans specifically designed for international residents with English-language support. Extensive network of healthcare providers across Spain with over 50,000 professionals. Coverage includes medical consultations, hospitalization, surgeries, preventive care, and emergency services. Additional products include home insurance, auto insurance, life insurance, and liability coverage. Mapfre Salud app for managing appointments and accessing digital health services. 24/7 medical assistance hotline in English.',
    specialties: ['Health Insurance', 'Home Insurance', 'Car Insurance', 'Life Insurance', 'Business Insurance'],
    languages: ['English', 'Spanish', 'French', 'Portuguese'],
    rating: 4.6,
    reviewCount: 720,
  },
  // TASK-1692: Integra Global - Malaga
  {
    id: 1698,
    name: 'Integra Global Health Insurance',
    category: 'Insurance Brokers',
    city: 'Malaga',
    address: 'Edificio Centro de Negocios, Avenida de Andalucía, 10, 29007 Malaga',
    phone: '+34 952 125 000',
    email: 'spain@integraglobal.com',
    website: 'https://www.integraglobal.com',
    description: 'Integra Global specializes exclusively in international health insurance for expats, globally mobile professionals, and international organizations. Unlike general insurers, they focus entirely on the unique needs of people living abroad. Comprehensive plans with full coverage in Spain and worldwide. No network restrictions - choose any doctor or hospital globally. English-speaking claims team with fast reimbursement processing. Plans include hospitalization, outpatient care, mental health, maternity, dental, and vision. Telemedicine services included in all plans. Expertise in handling complex expat insurance needs including pre-existing conditions and ongoing treatments.',
    specialties: ['Health Insurance', 'Expat Insurance', 'Life Insurance', 'Dental Insurance'],
    languages: ['English', 'Spanish', 'German', 'French'],
    rating: 4.8,
    reviewCount: 340,
  },
  // TASK-1692: Bupa Global - Malaga
  {
    id: 1699,
    name: 'Bupa Global',
    category: 'Insurance Brokers',
    city: 'Malaga',
    address: 'Muelle Uno, Local 45, 29001 Malaga',
    phone: '+34 951 203 500',
    email: 'spain@bupaglobal.com',
    website: 'https://www.bupaglobal.com',
    description: 'Bupa Global is a leading international health insurance provider with over 70 years of healthcare expertise. Part of the Bupa Group, a global healthcare company serving over 43 million customers worldwide. Premium health insurance plans designed for expats living in Spain with worldwide coverage options. Access to over 1.2 million healthcare providers globally with direct billing arrangements at major Spanish hospitals and clinics. 24/7 multilingual support including English-speaking health advisors. Comprehensive coverage including hospitalization, outpatient treatment, cancer care, mental health, maternity, and wellness programs. Bupa Global\'s second medical opinion service and health support line included with all plans.',
    specialties: ['Health Insurance', 'Life Insurance', 'Dental Insurance', 'Travel Insurance'],
    languages: ['English', 'Spanish', 'French', 'German', 'Dutch'],
    rating: 4.9,
    reviewCount: 480,
  },
  // TASK-1692: Iberian Insurance Services - Costa del Sol
  {
    id: 1700,
    name: 'Iberian Insurance Services',
    category: 'Insurance Brokers',
    city: 'Malaga',
    address: 'Calle Marqués de Larios, 9, 29005 Malaga',
    phone: '+34 952 600 800',
    email: 'info@iberianinsuranceservices.com',
    website: 'https://www.iberianinsuranceservices.com',
    description: 'Independent insurance brokerage specializing in expat insurance needs on the Costa del Sol for over 25 years. Not tied to any single insurer, allowing them to find the best coverage at competitive prices from multiple Spanish and international providers. Expertise in health insurance, home insurance for foreign property owners, car insurance, and business insurance. Full English-speaking service from initial consultation to claims handling. Strong relationships with major insurers including Sanitas, Adeslas, DKV, and AXA. Personalized service with dedicated account managers. Specializes in complex cases including seniors, those with pre-existing conditions, and business owners requiring tailored coverage.',
    specialties: ['Health Insurance', 'Home Insurance', 'Car Insurance', 'Business Insurance', 'Life Insurance'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 210,
  },
  // TASK-1692: Expat Insurance Spain - Barcelona
  {
    id: 1701,
    name: 'Expat Insurance Spain',
    category: 'Insurance Brokers',
    city: 'Barcelona',
    address: 'Carrer de Balmes, 152, 08008 Barcelona',
    phone: '+34 934 150 500',
    email: 'info@expatinsurancespain.com',
    website: 'https://www.expatinsurancespain.com',
    description: 'Independent insurance broker dedicated exclusively to serving the expat community in Barcelona and Catalonia. Established by expats who understand the unique insurance challenges of living abroad. Works with all major Spanish insurers to find the best coverage for health, home, car, and life insurance. Free no-obligation consultations in English. Expert guidance on Spanish insurance requirements including home insurance for mortgages, car insurance for foreign license holders, and private health insurance for residency applications. Specializes in helping new arrivals navigate the Spanish insurance system. Claims advocacy service to help clients resolve disputes with insurers.',
    specialties: ['Health Insurance', 'Home Insurance', 'Car Insurance', 'Life Insurance', 'Pet Insurance'],
    languages: ['English', 'Spanish', 'Catalan'],
    rating: 4.6,
    reviewCount: 185,
  },
  // TASK-1692: Health Insurance Direct - Madrid
  {
    id: 1702,
    name: 'Health Insurance Direct Spain',
    category: 'Insurance Brokers',
    city: 'Madrid',
    address: 'Paseo de la Castellana, 259-C, 28046 Madrid',
    phone: '+34 915 762 000',
    email: 'info@healthinsurancedirect.es',
    website: 'https://www.healthinsurancedirect.es',
    description: 'Specialist health insurance broker serving Madrid\'s international community for over 15 years. Independent broker working with Sanitas, Adeslas, DKV, AXA, Mapfre, and other major providers. Comprehensive comparison service to find the best health insurance plan for individual needs and budget. Expert advice on Spanish healthcare options including public system access vs. private insurance. Services include family plans, corporate health insurance, senior coverage, and plans with dental included. English-speaking advisors available for consultations at their Castellana office or via video call. Ongoing support for claims, policy changes, and adding family members.',
    specialties: ['Health Insurance', 'Dental Insurance', 'Life Insurance', 'Expat Insurance'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.8,
    reviewCount: 290,
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
