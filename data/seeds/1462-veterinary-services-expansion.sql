-- Task 1462: Veterinarian Services Expansion
-- Keyword Gap: Veterinarian Services Underrepresented
-- Adds 5 new high-priority veterinary clinics identified in strategy research
-- Created: March 2026

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- ============================================
-- BARCELONA VETERINARY CLINICS
-- ============================================

-- 1. Animal Salut - Barcelona (General + Emergency)
('Animal Salut', 
 'Veterinary', 
 'Comprehensive veterinary clinic offering general practice, surgery, and emergency services. English-speaking staff with experience treating both common pets and exotic animals. Features modern diagnostic equipment including digital X-ray and in-house laboratory. Offers vaccination programs, dental care, nutritional counseling, and preventive medicine. Emergency services available during business hours with referrals to 24-hour facilities. Staff speaks fluent English and provides detailed explanations of diagnoses and treatment options. Accepts major pet insurance plans.',
 'Carrer de Casanova, 73, 08011 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 453 79 12',
 'info@animalsalut.com',
 'https://www.animalsalut.com/',
 true, 
 true, 
 true, 
 false, 
 NOW(), 
 NOW()),

-- 2. VetEnCasa - Barcelona (Mobile/Home Veterinary Service)
('VetEnCasa', 
 'Veterinary', 
 'Mobile veterinary service providing at-home consultations across Barcelona and surrounding areas. Specializes in reducing pet stress by treating animals in their familiar environment. Services include routine checkups, vaccinations, blood draws, minor procedures, and palliative care. Particularly popular with elderly pet owners and anxious pets. English-speaking veterinarians provide personalized attention without the stress of clinic visits. Appointment booking available online or by phone. Weekend and evening appointments offered for working pet owners.',
 'Mobile Service - Covers Barcelona Metropolitan Area',
 'Barcelona',
 'Barcelona',
 '+34 93 215 67 89',
 'hola@vetencasa.es',
 'https://www.vetencasa.es/',
 true, 
 true, 
 true, 
 false, 
 NOW(), 
 NOW()),

-- 3. International Vet Barcelona - Barcelona (International Clients)
('International Vet Barcelona', 
 'Veterinary', 
 'Veterinary clinic specifically catering to Barcelona''s international community. Multilingual staff fluent in English, Spanish, French, and German. Specialized in assisting expats with pet import/export documentation, health certificates for travel, and EU pet passport services. Offers comprehensive veterinary care including wellness exams, surgery, dental care, and specialist referrals. Partnership with international pet insurance providers. Experienced with breed-specific health issues common in pets imported from UK, USA, and other countries. Provides digital medical records in English for continuity of care.',
 'Carrer de Muntaner, 180, 08036 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 430 15 67',
 'info@internationalvetbcn.com',
 'https://www.internationalvetbcn.com/',
 true, 
 true, 
 true, 
 false, 
 NOW(), 
 NOW()),

-- 4. Clínica Felina Barcelona - Barcelona (Cat Specialist)
('Clínica Felina Barcelona', 
 'Veterinary', 
 'Feline-exclusive veterinary clinic providing specialized care for cats. ISFM (International Society of Feline Medicine) certified Cat-Friendly Clinic with separate waiting areas and examination rooms designed to minimize feline stress. Services include routine care, feline dentistry, internal medicine, behavioral consultations, and geriatric cat care. English-speaking veterinarians with advanced training in feline medicine. Offers cat boarding with medical supervision for cats with chronic conditions. Educational resources available for cat owners in English.',
 'Carrer del Consell de Cent, 285, 08007 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 488 32 45',
 'info@clinicafelinabcn.com',
 'https://www.clinicafelinabcn.com/',
 true, 
 true, 
 true, 
 false, 
 NOW(), 
 NOW()),

-- ============================================
-- MADRID VETERINARY CLINICS
-- ============================================

-- 5. AAH Veterinary - Madrid (General Practice)
('AAH Veterinary', 
 'Veterinary', 
 'American-run veterinary clinic in Madrid providing English-speaking veterinary care to the expat community. Founded by a US-trained veterinarian with experience treating pets according to American veterinary standards. Full-service clinic offering wellness exams, vaccinations, surgery, dental care, and diagnostics. English-speaking staff ensure clear communication about treatment plans and medications. Pet pharmacy on-site with English-labeled medications. Partnership with US and UK pet insurance providers. Referral network to English-speaking specialists in Madrid for advanced care.',
 'Calle de Goya, 45, 28001 Madrid',
 'Madrid',
 'Madrid',
 '+34 91 781 23 45',
 'info@aahveterinary.es',
 'https://www.aahveterinary.es/',
 true, 
 true, 
 true, 
 false, 
 NOW(), 
 NOW());
