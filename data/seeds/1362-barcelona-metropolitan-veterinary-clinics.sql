-- Task 1362: Barcelona-Metropolitan Veterinary Analysis
-- Competitor Gap: Barcelona-Metropolitan Has 50+ Vet Listings
-- Source: barcelona-metropolitan.com/living/reader-recommendations-english-speaking-vets/
-- Analysis conducted: March 6, 2026

-- These are the 8 featured veterinary clinics from Barcelona Metropolitan's
-- editorial content, representing their core veterinary coverage.
-- This is a strategic seed to establish Spain Directory's veterinary category.
-- Note: is_verified=false because these are sourced from editorial content,
-- not independently verified by Spain English Directory.

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- ============================================
-- BARCELONA CITY CLINICS (Featured)
-- ============================================

-- 1. Borrell Clínica Veterinària - Eixample
('Borrell Clínica Veterinària', 
 'Veterinary', 
 'Friendly neighborhood clinic with in-house lab, diagnostic equipment, surgery and hospital facilities. Separate cat areas to minimize feline stress. Specialties include oncology, dentistry and dermatology. Grooming service and sustainable pet product shop available. Open Monday-Friday and Saturday mornings. General consultations €40. Accepts multiple insurance policies. Recommended by Barcelona resident Sinead Newman: "Hands down the best I''ve found. It''s a really nice space and has lovely stuff in the shop."',
 'Carrer del Comte Borrell, 157, 08015 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 188 26 79',
 'info@clinicaveterinariaborrell.com',
 'https://www.clinicaveterinariaborrell.com/',
 true, 
 true, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 2. Hospital Veterinari del Mar - Poblenou
('Hospital Veterinari del Mar', 
 'Veterinary', 
 'Specialist veterinary hospital with state-of-the-art diagnostic imaging technology. Treats dogs, cats and exotic pets with separate feline facilities. Offers physiotherapy, rehabilitation and animal behaviorist services. Team led by Laia Sánchez emphasizes open communication: "We try to involve the owner in every decision made about their pet." Open Monday-Friday and Saturday mornings. 24-hour emergency service year-round. General consultations €30 (€45 for exotic animals). Accepts SantéVet insurance.',
 'Carrer de la Marina, 69, 08005 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 021 78 12',
 'info@veterinariadelmar.com',
 'https://veterinariadelmar.com/',
 true, 
 true, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 3. L''Animalari - Born
('L''Animalari', 
 'Veterinary', 
 'Small friendly clinic tucked away in the winding streets of the Born district. Features in-house diagnostics, lab, surgery and hospitalization facilities. Head vet Jesús speaks perfect English and German. Highly recommended by expats for 12+ years of excellent service. Julie Stephenson says: "Jesús speaks perfect English. Highly recommend and all my friends who use them would say the same." Grooming service available. Home visits offered. Does not accept insurance directly but can recommend providers for reimbursement.',
 'Carrer de Sant Pere Més Baix, 73, 08003 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 310 23 59',
 'info@animalari.com',
 'http://www.animalari.com/en/',
 true, 
 true, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 4. Hospital Veterinari Glòries - Glòries
('Hospital Veterinari Glòries', 
 'Veterinary', 
 'Large hospital equipped to perform wide range of diagnostic tests, treatments and surgeries. 20+ team includes specialists in internal medicine, neurology and oncology. ISFM Cat-Friendly accredited with dedicated feline facilities. Also treats exotic pets. Suzanne Wales says: "I recently took my cat to HVG and their service was amazing! In fact, it was cheaper than doing the op at my local vet." Open Monday-Friday and Saturday morning. 24/7 emergency service year-round. Consultations from €41. Accepts Mussap, Mapfre, Agrupació and Allianz insurance.',
 'Avinguda Diagonal, 237, 08013 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 246 08 05',
 'info@hospitalveterinariglories.com',
 'https://www.hospitalveterinariglories.com/',
 true, 
 true, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 5. Hospital Veterinari Montjuïc - Poble-sec
('Hospital Veterinari Montjuïc', 
 'Veterinary', 
 'Specialized team in different areas of veterinary medicine treating everyday and exotic pets. Especially known for expertise in neurology and ophthalmology. Features brand-new MRI machine and full diagnostic equipment. Also offers grooming service, shop, canine café and physio/rehab pool. Professional training program with ongoing seminars and courses. Open Monday-Friday. 24/7 emergency service all year. Accepts Asegurança Salut Veterinaria insurance.',
 'Carrer de Mèxic, 30, 08004 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 423 77 11',
 'info@hvmontjuic.com',
 'https://hvmontjuic.com/',
 true, 
 true, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- ============================================
-- SURROUNDING AREAS (Not featured)
-- ============================================

-- 6. Clínica Veterinària Mirasol - Sant Cugat
('Clínica Veterinària Mirasol', 
 'Veterinary', 
 'Full-service clinic a few minutes walk from Mirasol train station. Features complete diagnostics, surgery and hospitalization facilities. Specializes in traumatology and ophthalmology. Offers innovative stem cell therapy and regenerative medicine for various conditions. Open Monday-Friday and Saturday mornings. Home visits available. One of the few in Sant Cugat offering 24-hour emergency service. General consultations €35.80. Accepts SegurVet insurance.',
 'Carrer de Vallseca, 140, local 2, 08195 Sant Cugat del Vallès',
 'Sant Cugat del Vallès',
 'Barcelona',
 '+34 93 589 49 78',
 'info@clinicaveterinariamirasol.com',
 'http://www.clinicaveterinariamirasol.com/',
 true, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 7. Hospital Veterinari Sala Gorön - Sitges
('Hospital Veterinari Sala Gorön', 
 'Veterinary', 
 'Serves both expat community and visiting tourists in Sitges. Large team of specialists known for expertise in cardiology, traumatology, dermatology, neurology, internal medicine and surgery. Treats exotic animals as well as cats and dogs. Features separate hospitalization areas for cats and infectious patients. Open Monday-Saturday. 24-hour emergency service available year-round. General consultations €40 (€77 emergency). Part of Veteralia group - accepts Veteralia Protect insurance and offers loyalty card.',
 'Carrer d''Espalter, 22, 08870 Sitges',
 'Sitges',
 'Barcelona',
 '+34 93 894 01 08',
 'info@veteralia.com',
 'https://www.veteralia.com/hospital-veterinari-sala-goron-es/',
 true, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW()),

-- 8. Hospital Veterinari Desvern - Sant Just Desvern
('Hospital Veterinari Desvern', 
 'Veterinary', 
 'Centrally located just off Carrer Major. Dr. Xavier Tortusau''s team are experts in traumatology, orthopedics and neurosurgery, equipped to tackle complex surgical procedures. Also offers stem cell therapy, physiotherapy and rehabilitation, plus behavioral and nutritional advice. Features on-site shop. Open Monday-Saturday. 24-hour emergency service. General consultations €49. Accepts multiple insurance policies.',
 'Carrer Roquetes, 6 b, 08960 Sant Just Desvern',
 'Sant Just Desvern',
 'Barcelona',
 '+34 93 499 06 48',
 'info@veterinari-desvern.es',
 'https://www.veterinari-desvern.es/',
 true, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW());
