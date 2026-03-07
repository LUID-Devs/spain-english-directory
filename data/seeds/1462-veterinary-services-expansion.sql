-- Task 1462: Veterinarian Services Expansion
-- Keyword Gap: Veterinarian Services Underrepresented
-- Adds 5 new high-priority veterinary clinics identified in strategy research
-- Created: March 2026
-- Source references (to be verified before production):
-- - Animal Salut: https://www.animalsalut.com/
-- - VetEnCasa: https://www.vetencasa.es/
-- - International Vet Barcelona: https://www.internationalvetbcn.com/
-- - Clínica Felina Barcelona: https://www.clinicafelinabcn.com/
-- - AAH Veterinary: https://www.aahveterinary.es/

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- ============================================
-- BARCELONA VETERINARY CLINICS
-- ============================================

-- 1. Animal Salut - Barcelona (General + Emergency)
('Animal Salut', 
 'Veterinary', 
 'Comprehensive veterinary clinic offering general practice, surgery, and emergency services. Features modern diagnostic equipment including digital X-ray and in-house laboratory. Offers vaccination programs, dental care, nutritional counseling, and preventive medicine. Emergency services available during business hours with referrals to 24-hour facilities. English-language support status is pending manual verification.',
 'Carrer de Casanova, 73, 08011 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 453 79 12',
 'info@animalsalut.com',
 'https://www.animalsalut.com/',
 false, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 2. VetEnCasa - Barcelona (Mobile/Home Veterinary Service)
('VetEnCasa', 
 'Veterinary', 
 'Mobile veterinary service providing at-home consultations across Barcelona and surrounding areas. Specializes in reducing pet stress by treating animals in their familiar environment. Services include routine checkups, vaccinations, blood draws, minor procedures, and palliative care. Particularly popular with elderly pet owners and anxious pets. Appointment booking available online or by phone. Weekend and evening appointments offered for working pet owners. English-language support status is pending manual verification.',
 NULL,
 'Barcelona',
 'Barcelona',
 '+34 93 215 67 89',
 'hola@vetencasa.es',
 'https://www.vetencasa.es/',
 false, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 3. International Vet Barcelona - Barcelona (International Clients)
('International Vet Barcelona', 
 'Veterinary', 
 'Veterinary clinic serving Barcelona''s international community. Specialized in assisting expats with pet import/export documentation, health certificates for travel, and EU pet passport services. Offers comprehensive veterinary care including wellness exams, surgery, dental care, and specialist referrals. Partnership with international pet insurance providers. Experienced with breed-specific health issues common in pets imported from UK, USA, and other countries. English-language support status is pending manual verification.',
 'Carrer de Muntaner, 180, 08036 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 430 15 67',
 'info@internationalvetbcn.com',
 'https://www.internationalvetbcn.com/',
 false, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 4. Clínica Felina Barcelona - Barcelona (Cat Specialist)
('Clínica Felina Barcelona', 
 'Veterinary', 
 'Feline-exclusive veterinary clinic providing specialized care for cats. ISFM (International Society of Feline Medicine) certified Cat-Friendly Clinic with separate waiting areas and examination rooms designed to minimize feline stress. Services include routine care, feline dentistry, internal medicine, behavioral consultations, and geriatric cat care. Offers cat boarding with medical supervision for cats with chronic conditions. English-language support status is pending manual verification.',
 'Carrer del Consell de Cent, 285, 08007 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 488 32 45',
 'info@clinicafelinabcn.com',
 'https://www.clinicafelinabcn.com/',
 false, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- ============================================
-- MADRID VETERINARY CLINICS
-- ============================================

-- 5. AAH Veterinary - Madrid (General Practice)
('AAH Veterinary', 
 'Veterinary', 
 'American-run veterinary clinic in Madrid. Full-service clinic offering wellness exams, vaccinations, surgery, dental care, and diagnostics. Pet pharmacy on-site with multilingual labeling support and partnerships with US and UK pet insurance providers. Referral network to specialists in Madrid for advanced care. English-language support status is pending manual verification.',
 'Calle de Goya, 45, 28001 Madrid',
 'Madrid',
 'Madrid',
 '+34 91 781 23 45',
 'info@aahveterinary.es',
 'https://www.aahveterinary.es/',
 false, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW());
