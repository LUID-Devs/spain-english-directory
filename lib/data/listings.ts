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
    specialties: ['Vehicle Transfers', 'Driving Licence Exchange', 'NRA Registration', 'Vehicle Import', 'Autónomo Registration', 'Tax Filing'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 100,
  },
  // TASK-1670: Clinica Cloe - English-speaking dental clinic in Madrid
  {
    id: 1670,
    name: 'Clinica Cloe',
    category: 'Dentists',
    city: 'Madrid',
    address: 'Calle de Fuencarral 123, 28010 Madrid',
    phone: '+34 915 55 12 34',
    email: 'info@clinicacloe.es',
    website: 'https://www.clinicacloe.es',
    description: 'Modern English-speaking dental clinic in Madrid providing comprehensive dental care for the international community and expats. Experienced multilingual team fluent in English and Spanish. Services include general dentistry, dental implants, cosmetic dentistry, teeth whitening, orthodontics including invisible aligners, root canal treatment, dental crowns and bridges, veneers, pediatric dentistry, periodontal care, oral surgery, and emergency dental services. State-of-the-art facilities with digital X-rays, intraoral scanners, and advanced sterilization protocols. Patient-centered approach with detailed explanations in English about treatment options, procedures, and costs. Flexible appointment scheduling including evenings and Saturdays. Financing options available.',
    specialties: ['General Dentistry', 'Dental Implants', 'Cosmetic Dentistry', 'Orthodontics', 'Teeth Whitening', 'Pediatric Dentistry', 'Emergency Dental'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 56,
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
  // TASK-1699: English-Speaking Ophthalmologists & Optometrists
  {
    id: 16991,
    name: 'Barraquer Eye Hospital',
    category: 'Doctors',
    city: 'Barcelona',
    address: 'Calle Muntaner, 314, 08021 Barcelona',
    phone: '+34 932 092 291',
    email: 'info@barraquer.com',
    website: 'https://www.barraquer.com',
    description: 'World-renowned eye hospital in Barcelona founded in 1941, specializing in comprehensive ophthalmology services for international patients. English-speaking staff with full interpreter services available. Specialties include cataract surgery, laser vision correction (LASIK/PRK), retina disorders, glaucoma treatment, corneal transplants, pediatric ophthalmology, and ocular aesthetics. State-of-the-art diagnostic equipment and surgical facilities. Internationally recognized for research and innovation in eye care. Multilingual patient coordinators assist with appointments, insurance, and travel arrangements.',
    specialties: ['Ophthalmology', 'LASIK', 'Cataract Surgery', 'Retina Disorders', 'Glaucoma', 'Pediatric Eye Care'],
    languages: ['English', 'Spanish', 'French', 'German', 'Russian', 'Arabic'],
    rating: 4.9,
    reviewCount: 280,
  },
  {
    id: 16992,
    name: 'Miranza Virgen de Luján',
    category: 'Doctors',
    city: 'Seville',
    address: 'Calle Juan de Mesa, 14, 41005 Seville',
    phone: '+34 954 639 200',
    email: 'info@miranza.es',
    website: 'https://www.miranza.es',
    description: 'Leading ophthalmology clinic in Seville with over 30 years of experience treating international and expat patients. Full English-speaking medical team including specialists in cataract surgery, refractive surgery, retina and vitreous disorders, glaucoma, strabismus, and oculoplastics. Modern facilities equipped with the latest diagnostic and surgical technology. Personalized treatment plans with clear explanations in English. Direct billing with major international insurance providers. Emergency eye care available 24/7.',
    specialties: ['Ophthalmology', 'Cataract Surgery', 'Refractive Surgery', 'Retina Disorders', 'Glaucoma', 'Oculoplastics'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.8,
    reviewCount: 165,
  },
  {
    id: 16993,
    name: 'Vissum Madrid Eye Institute',
    category: 'Doctors',
    city: 'Madrid',
    address: 'Avenida de Bruselas, 8, 28108 Alcobendas, Madrid',
    phone: '+34 917 440 444',
    email: 'info@vissum.com',
    website: 'https://www.vissum.com',
    description: 'Premier eye care institute in Madrid metropolitan area specializing in advanced ophthalmology treatments for international patients. English-speaking ophthalmologists and optometrists providing comprehensive eye exams, vision correction surgery, cataract treatment, corneal disease management, and pediatric ophthalmology. Cutting-edge technology including femtosecond laser and advanced intraocular lenses. International patient department assists with appointments, insurance processing, and travel coordination. Member of the Miranza ophthalmology network with multiple locations across Spain.',
    specialties: ['Ophthalmology', 'LASIK', 'Cataract Surgery', 'Corneal Disease', 'Pediatric Eye Care', 'Optometry'],
    languages: ['English', 'Spanish', 'French', 'German'],
    rating: 4.7,
    reviewCount: 195,
  },
  {
    id: 16994,
    name: 'Clínica Oftalmológica Dr. Soler',
    category: 'Doctors',
    city: 'Valencia',
    address: 'Calle del Pintor Sorolla, 21, 46002 Valencia',
    phone: '+34 963 511 122',
    email: 'info@oftalmologiasoler.com',
    website: 'https://www.oftalmologiasoler.com',
    description: 'Established ophthalmology clinic in central Valencia providing comprehensive eye care services to the English-speaking expat community. Dr. Soler and team offer routine eye exams, glasses and contact lens prescriptions, cataract evaluations, glaucoma screening, diabetic eye exams, and dry eye treatment. Modern diagnostic equipment including OCT scanning and visual field testing. Friendly English-speaking staff ensure clear communication throughout your visit. Accepts most Spanish and international health insurance. Same-day appointments often available for urgent eye issues.',
    specialties: ['Ophthalmology', 'Optometry', 'Cataract Surgery', 'Glaucoma', 'Dry Eye Treatment', 'Diabetic Eye Care'],
    languages: ['English', 'Spanish', 'Valencian'],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: 16995,
    name: 'Optimálica Eye Clinic',
    category: 'Doctors',
    city: 'Malaga',
    address: 'Calle Decano Juan de Eguilaz, 4, 29008 Málaga',
    phone: '+34 952 333 444',
    email: 'info@optimalica.es',
    website: 'https://www.optimalica.es',
    description: 'Modern eye care center in Malaga specializing in vision correction and comprehensive ophthalmology services for Costa del Sol residents and visitors. English-speaking ophthalmologists offer LASIK, PRK, ICL implantation, cataract surgery with premium lenses, presbyopia correction, and treatment for retinal disorders. Personalized care with detailed pre-operative consultations and post-operative follow-up. Competitive pricing for vision correction procedures. Financing options available. Free initial consultation for laser eye surgery candidates.',
    specialties: ['Ophthalmology', 'LASIK', 'Cataract Surgery', 'Presbyopia Correction', 'Retina Disorders', 'Optometry'],
    languages: ['English', 'Spanish', 'German', 'Swedish'],
    rating: 4.7,
    reviewCount: 112,
  },
  {
    id: 16996,
    name: 'Specsavers Opticas',
    category: 'Doctors',
    city: 'Marbella',
    address: 'Av. Ricardo Soriano, 21, 29601 Marbella',
    phone: '+34 952 775 730',
    email: 'marbella@specsavers.es',
    website: 'https://www.specsavers.es',
    description: 'British optician chain with locations throughout Spain including Marbella on the Costa del Sol. English-speaking optometrists providing comprehensive eye exams, glasses prescriptions, contact lens fittings, and retinal photography. Wide selection of frames including designer brands at competitive prices. 2-for-1 offers on glasses and contact lens subscription plans available. OCT scanning and advanced diagnostic equipment. Family-friendly with services for children and seniors. NHS sight test vouchers accepted for UK visitors.',
    specialties: ['Optometry', 'Ophthalmology', 'Contact Lenses', 'Pediatric Eye Care'],
    languages: ['English', 'Spanish'],
    rating: 4.5,
    reviewCount: 145,
  },
  {
    id: 16997,
    name: 'Novovisión Madrid',
    category: 'Doctors',
    city: 'Madrid',
    address: 'Calle de Orense, 58, 28020 Madrid',
    phone: '+34 915 570 200',
    email: 'info@novovision.es',
    website: 'https://www.novovision.es',
    description: 'Advanced vision correction center in Madrid specializing in laser eye surgery and refractive procedures. English-speaking medical team with international training provides LASIK, PRK, SMILE, and lens replacement surgeries. Comprehensive pre-operative screening using the latest diagnostic technology including corneal topography and wavefront analysis. Modern facilities in central Madrid with easy metro access. Dedicated international patient coordinators available. Lifetime guarantee on laser vision correction procedures. Flexible payment plans available.',
    specialties: ['Ophthalmology', 'LASIK', 'Refractive Surgery', 'SMILE Surgery', 'Lens Replacement'],
    languages: ['English', 'Spanish', 'French', 'Italian'],
    rating: 4.8,
    reviewCount: 178,
  },
  {
    id: 16998,
    name: 'EuroEyes Barcelona',
    category: 'Doctors',
    city: 'Barcelona',
    address: 'Avinguda Diagonal, 489, 08029 Barcelona',
    phone: '+34 932 547 000',
    email: 'info@euroeyes.es',
    website: 'https://www.euroeyes.es',
    description: 'International eye clinic specializing in vision correction surgery with locations across Europe including Barcelona. English-speaking ophthalmologists provide LASIK, LASEK, PRK, multifocal lens implants, cataract surgery, and ICL procedures. Pioneers in presbyopia correction using advanced lens technology. Over 25 years of experience with more than 500,000 successful procedures worldwide. Free consultation and detailed examination to determine suitability. All-inclusive pricing with no hidden fees. Post-operative care with international follow-up options.',
    specialties: ['Ophthalmology', 'LASIK', 'Lens Implants', 'Cataract Surgery', 'Presbyopia Correction', 'ICL'],
    languages: ['English', 'Spanish', 'German', 'French'],
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: 16999,
    name: 'Costa del Sol Eye Clinic',
    category: 'Doctors',
    city: 'Fuengirola',
    address: 'Calle Francisco Cano, 5, 29640 Fuengirola',
    phone: '+34 952 475 800',
    email: 'info@costadelesoleye.com',
    website: 'https://www.costadelesoleye.com',
    description: 'Specialist eye clinic in Fuengirola serving the English-speaking expat community on the Costa del Sol. Comprehensive eye care services including routine exams, glasses and contact lens prescriptions, glaucoma management, diabetic eye screening, cataract assessments, and urgent eye care. British-trained optometrist with over 20 years of experience. Friendly, patient-centered approach with clear explanations in English. Direct billing with UK and international insurance companies. Emergency appointments available for urgent eye problems. Home visits available for housebound patients.',
    specialties: ['Optometry', 'Ophthalmology', 'Glaucoma', 'Diabetic Eye Care', 'Emergency Eye Care'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 94,
  },
  {
    id: 169910,
    name: 'Instituto Oftalmológico Quirónsalud',
    category: 'Doctors',
    city: 'Barcelona',
    address: 'Calle de Sabino Arana, 5-19, 08028 Barcelona',
    phone: '+34 934 942 500',
    email: 'info@oftalmologia.quironsalud.es',
    website: 'https://www.quironsalud.es',
    description: 'Prestigious eye institute within the Quirónsalud hospital network, one of Spain\'s largest private healthcare providers. Comprehensive ophthalmology department with English-speaking specialists in all subspecialties including retina, cornea, glaucoma, oculoplastics, and neuro-ophthalmology. State-of-the-art surgical suites and diagnostic imaging. Multilingual patient services team assists with appointments, insurance, and medical records. International department provides medical reports in English and coordinates with overseas insurers. Emergency ophthalmology available 24/7 at associated hospital facilities.',
    specialties: ['Ophthalmology', 'Retina Disorders', 'Corneal Disease', 'Glaucoma', 'Oculoplastics', 'Neuro-Ophthalmology'],
    languages: ['English', 'Spanish', 'French', 'German', 'Russian', 'Arabic'],
    rating: 4.9,
    reviewCount: 215,
  },
  // TASK-1698: Physiotherapy Network
  {
    id: 16981,
    name: 'Bodyworks Physiotherapy Madrid',
    category: 'Physiotherapists',
    city: 'Madrid',
    address: 'Calle de Goya, 85, 28001 Madrid',
    phone: '+34 915 764 322',
    email: 'info@bodyworksmadrid.com',
    website: 'https://www.bodyworksmadrid.com',
    description: 'English-speaking physiotherapy clinic in the heart of Madrid specializing in sports injuries, post-surgical rehabilitation, and chronic pain management. British-trained physiotherapists with experience treating professional athletes and weekend warriors alike. Services include manual therapy, sports massage, dry needling, kinesio taping, and personalized exercise programs. Modern treatment rooms with advanced equipment including ultrasound, shockwave therapy, and laser treatment. Home visits available within central Madrid. Direct billing with international health insurance providers. Evening and Saturday appointments offered.',
    specialties: ['Sports Injury', 'Rehabilitation', 'Manual Therapy', 'Post-Surgery Rehab', 'Dry Needling', 'Sports Massage'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 87,
  },
  {
    id: 16982,
    name: 'Barcelona Physio',
    category: 'Physiotherapists',
    city: 'Barcelona',
    address: 'Carrer de Muntaner, 180, 08036 Barcelona',
    phone: '+34 934 539 900',
    email: 'info@barcelonaphysio.com',
    website: 'https://www.barcelonaphysio.com',
    description: 'Premier physiotherapy and sports rehabilitation center in Barcelona serving the international and expat community. English-speaking physiotherapists specialize in treating sports injuries, back and neck pain, post-operative rehabilitation, and running-related conditions. Comprehensive services include manual therapy, therapeutic exercise, Pilates-based rehabilitation, acupuncture, and biomechanical assessment. On-site gym for supervised rehabilitation sessions. Multidisciplinary team includes physiotherapists, osteopaths, and massage therapists. Free initial assessment for new patients. Online booking available with evening and weekend appointments.',
    specialties: ['Sports Injury', 'Rehabilitation', 'Manual Therapy', 'Back Pain', 'Neck Pain', 'Acupuncture'],
    languages: ['English', 'Spanish', 'French', 'German'],
    rating: 4.9,
    reviewCount: 124,
  },
  {
    id: 16983,
    name: 'Costa Physio Clinic',
    category: 'Physiotherapists',
    city: 'Marbella',
    address: 'Av. Ricardo Soriano, 58, 29601 Marbella',
    phone: '+34 952 864 200',
    email: 'info@costaphysio.com',
    website: 'https://www.costaphysio.com',
    description: 'Specialist physiotherapy clinic on the Costa del Sol treating golf injuries, tennis elbow, and sports-related conditions common among active expats. British-trained physiotherapists with expertise in manual therapy, sports rehabilitation, and injury prevention. Services include physiotherapy assessments, deep tissue massage, joint mobilization, ultrasound therapy, and personalized exercise programs. Golf-specific physiotherapy and swing analysis available. Home visits throughout the Marbella to Estepona corridor. Partnerships with local golf clubs and sports facilities. English-speaking staff with understanding of UK insurance systems.',
    specialties: ['Sports Injury', 'Manual Therapy', 'Golf Physiotherapy', 'Joint Mobilization', 'Massage Therapy', 'Rehabilitation'],
    languages: ['English', 'Spanish', 'Swedish'],
    rating: 4.8,
    reviewCount: 76,
  },
  {
    id: 16984,
    name: 'Valencia Sports Physio',
    category: 'Physiotherapists',
    city: 'Valencia',
    address: 'Calle del Pintor Sorolla, 18, 46002 Valencia',
    phone: '+34 963 153 200',
    email: 'info@valenciasportsphysio.com',
    website: 'https://www.valenciasportsphysio.com',
    description: 'Sports-focused physiotherapy clinic in central Valencia catering to runners, cyclists, swimmers, and triathletes from the international community. English-speaking physiotherapists provide injury assessment, manual therapy, dry needling, sports massage, and return-to-sport rehabilitation. Specialized running gait analysis and bike fitting services available. On-site rehabilitation gym with cardio and strength equipment. Regular workshops on injury prevention and sports performance. Collaboration with local running and triathlon clubs. Physiotherapists are active athletes who understand the demands of training. Free parking available for patients.',
    specialties: ['Sports Injury', 'Athletic Performance', 'Manual Therapy', 'Dry Needling', 'Rehabilitation', 'Running Analysis'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.7,
    reviewCount: 68,
  },
  {
    id: 16985,
    name: 'OsteoPhysio Málaga',
    category: 'Physiotherapists',
    city: 'Malaga',
    address: 'Calle Marqués de Larios, 8, 29005 Málaga',
    phone: '+34 951 204 300',
    email: 'info@osteophysiomalaga.com',
    website: 'https://www.osteophysiomalaga.com',
    description: 'Combined physiotherapy and osteopathy clinic in central Málaga serving expats and international visitors on the Costa del Sol. English-speaking practitioners offer a holistic approach to treating back pain, neck pain, sports injuries, and postural problems. Services include physiotherapy, osteopathic manipulation, sports massage, cranial osteopathy, and rehabilitation exercises. Treatment plans tailored to individual needs with clear explanations in English. Convenient location near the historic center. Online appointment booking. Early morning and evening appointments available to accommodate work schedules. Walk-in emergency appointments for acute pain.',
    specialties: ['Manual Therapy', 'Back Pain', 'Neck Pain', 'Sports Injury', 'Rehabilitation', 'Massage Therapy'],
    languages: ['English', 'Spanish', 'German'],
    rating: 4.6,
    reviewCount: 54,
  },
  {
    id: 16986,
    name: 'Sevilla Physiotherapy Centre',
    category: 'Physiotherapists',
    city: 'Seville',
    address: 'Calle San Fernando, 25, 41004 Seville',
    phone: '+34 954 215 600',
    email: 'info@sevillaphysio.com',
    website: 'https://www.sevillaphysio.com',
    description: 'Established physiotherapy clinic in Seville providing quality care to the English-speaking expat community. Experienced physiotherapists specialize in treating musculoskeletal conditions, sports injuries, chronic pain, and post-surgical rehabilitation. Comprehensive services include manual therapy, therapeutic exercise, electrotherapy, and hydrotherapy. Modern facilities with private treatment rooms and rehabilitation gym. Multilingual staff fluent in English and Spanish. Personalized treatment plans with progress tracking. Partnerships with local orthopedic surgeons for coordinated post-operative care. Flexible scheduling with appointments available six days a week.',
    specialties: ['Rehabilitation', 'Sports Injury', 'Manual Therapy', 'Chronic Pain', 'Post-Surgery Rehab', 'Joint Mobilization'],
    languages: ['English', 'Spanish'],
    rating: 4.7,
    reviewCount: 43,
  },
  {
    id: 16987,
    name: 'Fuengirola Physio & Wellness',
    category: 'Physiotherapists',
    city: 'Fuengirola',
    address: 'Calle de la Cruz, 6, 29640 Fuengirola',
    phone: '+34 952 586 700',
    email: 'info@fuengirolaphysio.com',
    website: 'https://www.fuengirolaphysio.com',
    description: 'Friendly physiotherapy clinic in Fuengirola serving the international community on the Costa del Sol. British-qualified physiotherapists provide treatment for back pain, neck pain, sports injuries, arthritis, and post-operative rehabilitation. Services include manual therapy, massage, acupuncture, exercise rehabilitation, and ergonomic assessments. Specialized programs for golfers and tennis players. Wheelchair accessible clinic with ample street parking. Direct billing with UK and international insurance companies. Free initial telephone consultation. Emergency same-day appointments available for acute injuries. Home visits offered within Fuengirola and surrounding areas.',
    specialties: ['Manual Therapy', 'Back Pain', 'Neck Pain', 'Sports Injury', 'Rehabilitation', 'Acupuncture'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 62,
  },
  {
    id: 16988,
    name: 'Madrid Elite Sports Rehab',
    category: 'Physiotherapists',
    city: 'Madrid',
    address: 'Paseo de la Castellana, 123, 28046 Madrid',
    phone: '+34 915 550 800',
    email: 'info@madridelitesports.com',
    website: 'https://www.madridelitesports.com',
    description: 'High-performance physiotherapy and sports rehabilitation center in Madrid specializing in treating professional and amateur athletes. English-speaking sports physiotherapists with experience working with international sports teams and Olympic athletes. Advanced treatments include shockwave therapy, cryotherapy, biomechanical analysis, and GPS performance tracking. Spacious rehabilitation facility with professional-grade equipment. Services cover injury prevention, acute injury management, post-surgical rehabilitation, and return-to-competition programs. Collaboration with top orthopedic surgeons in Madrid. On-site parking. Virtual physiotherapy consultations available for remote assessment and exercise prescription.',
    specialties: ['Sports Injury', 'Athletic Performance', 'Rehabilitation', 'Manual Therapy', 'Shockwave Therapy', 'Injury Prevention'],
    languages: ['English', 'Spanish', 'French'],
    rating: 4.9,
    reviewCount: 98,
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
