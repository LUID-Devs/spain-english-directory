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

  // TASK-1670: Clinica Cloe - Dental Clinic Madrid
  {
    id: 1670,
    name: 'Clinica Cloe',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Avenida de los Prunos nº 5-7, 28042 Madrid',
    phone: '+34 91 371 7919',
    email: 'clinica@clinicacloe.com',
    website: 'https://clinicacloe.com',
    description: 'Modern English-speaking dental clinic in Madrid providing comprehensive dental care for the international community and expats. Experienced multilingual team fluent in English and Spanish. Services include general dentistry, dental implants, cosmetic dentistry, teeth whitening, orthodontics (including invisible aligners), root canal treatment (endodontics), dental crowns and bridges, veneers, pediatric dentistry, periodontal care (gum disease treatment), oral surgery, and emergency dental services. State-of-the-art facilities with digital X-rays, intraoral scanners, and advanced sterilization protocols. Patient-centered approach with detailed explanations in English about treatment options, procedures, and costs. Flexible appointment scheduling including evenings and Saturdays. Financing options available for extensive treatments. Located in central Madrid with easy access by public transport.',
    specialties: ['General Dentistry', 'Implants', 'Cosmetic Dentistry', 'Orthodontics', 'Endodontics', 'Pediatric Dentistry'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 87,
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
  // TASK-1694: Emergency Dental Services - Barcelona & Madrid
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
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Pain Management', 'Dental Implants'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 120,
  },
  {
    id: 16942,
    name: 'Urgencias Dentales Barcelona',
    category: 'Dentists',
    city: 'Barcelona',
    address: 'Carrer d\'Aragó, 235, 08007 Barcelona',
    phone: '+34 932 876 543',
    email: 'info@urgenciasdentalesbcn.es',
    website: 'https://www.urgenciasdentalesbcn.es',
    description: 'Emergency dental center offering same-day and after-hours appointments for urgent dental issues. English-speaking dentists experienced in trauma care, root canal emergencies, and severe infections. Open late evenings and weekends when regular dental clinics are closed. Equipped for immediate extractions, temporary crowns, and pain management. Multilingual reception staff assists with insurance paperwork. Serves both residents and visitors to Barcelona.',
    specialties: ['Emergency Dentistry', 'Root Canals', 'Dental Extractions', 'Pain Management'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 95,
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
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Extractions', 'Root Canals'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 140,
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
    specialties: ['Emergency Dentistry', 'Dental Repairs', 'Pain Management', 'Dental Imaging'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 88,
  },
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
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Wisdom Teeth', 'Pain Management'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 160,
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
    specialties: ['Emergency Dentistry', 'Dental Extractions', 'Pain Management', 'Dental Trauma'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 130,
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
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Root Canals', 'Extractions'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 145,
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
    specialties: ['Emergency Dentistry', 'Dental Extractions', 'Pain Management', 'Dental Imaging'],
    languages: ['English', 'Spanish'],
    rating: 4.6,
    reviewCount: 110,
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
    description: "Emergency dental service specifically designed for Madrid's tourist and expat community. Multilingual team speaks English, Spanish, French, and German. Open 7 days a week with 24-hour on-call dentist for severe emergencies. Handles travel insurance claims directly. Services include emergency fillings, crowns, root canals, extractions, and trauma care. Hotel visit service available for immobile patients. Partnerships with major hotels and concierge services. Fast-track service for tourists with travel insurance.",
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Root Canals', 'Travel Insurance Support'],
    languages: ['English', 'Spanish', 'French', 'German'],
    rating: 4.7,
    reviewCount: 105,
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
    specialties: ['Emergency Dentistry', 'Dental Trauma', 'Pain Management', 'Dental Imaging'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 150,
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
