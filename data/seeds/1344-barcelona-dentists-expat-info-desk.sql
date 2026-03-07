-- Task 1344: Expat Info Desk Gap Fill - Barcelona Dentists
-- Source: expatinfodesk.com competitor analysis
-- Priority: HIGH - High demand category, multi-lingual providers

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- 1. Dr. Nicholas Jones (English & French)
('Dr. Nicholas Jones', 'Dentists', 'English and French-speaking dentist in Barcelona on Avinguda Diagonal. Provides general dentistry services with international patient experience. Convenient central location on Barcelona''s main avenue. Experience working with expat patients from English and French-speaking countries.', 'Avinguda Diagonal, 281, 08013 Barcelona', 'Barcelona', 'Barcelona', '+34 932 658 070', 'nickteeth@hotmail.com', NULL, true, false, true, false, NOW(), NOW()),

-- 2. Dr. Philippe G Sissmann (English & French)
('Dr. Philippe G Sissmann', 'Dentists', 'French and English-speaking dentist in Barcelona Sant Gervasi district. Provides comprehensive dental care with international standards. Located on Carrer de Tusset in a residential area popular with expats. Experience with patients from French-speaking countries.', 'Carrer de Tusset, 13, 2º, 08006 Barcelona', 'Barcelona', 'Barcelona', '+34 934 147 291', 'clinicasissmann@yahoo.es', NULL, true, false, true, false, NOW(), NOW()),

-- 3. Dr. Brion (English, German & French)
('Dr. Brion', 'Dentists', 'Multi-lingual dentist in Barcelona speaking English, German, and French. Provides general and specialized dental services to international patients. Located near Tres Torres in the Sant Gervasi district. Particularly valuable for German and French-speaking expats.', 'Carrer del Capità Arenas, 28, 1, 4º escala a, 08034 Barcelona', 'Barcelona', 'Barcelona', '+34 932 803 346', 'jhbrion@hotmail.com', NULL, true, false, true, false, NOW(), NOW()),

-- 4. Dr. Joseph de Vilallonga (English & Japanese) - UNIQUE
('Dr. Joseph de Vilallonga', 'Dentists', 'Unique English and Japanese-speaking dentist in Barcelona. One of the few dentists in Barcelona serving the Japanese expat community. Provides comprehensive dental care with experience treating international patients. Located near Turó Park in the Sarrià-Sant Gervasi district. Long-established practice with reputation in the expat community.', 'Carrer de Calvet, 15, principal 1a, 08021 Barcelona', 'Barcelona', 'Barcelona', '+34 932 096 121', 'info@clinicavilallonga.com', 'https://www.clinicavilallonga.com', true, true, true, false, NOW(), NOW()),

-- 5. Dr. David Huertas (English, German & French)
('Dr. David Huertas', 'Dentists', 'Multi-lingual dentist in Barcelona speaking English, German, and French. Provides comprehensive dental services to international patients. Located on Carrer del Doctor Roux near Turó Park. Experience working with diverse expat communities.', 'Carrer del Doctor Roux, 47, baixos, 08017 Barcelona', 'Barcelona', 'Barcelona', '+34 932 066 036', 'dhuerta@teleline.es', NULL, true, false, true, false, NOW(), NOW()),

-- 6. Dr. Eduardo Vazquez Delgado
('Dr. Eduardo Vazquez Delgado', 'Dentists', 'English-speaking dentist practicing at Centro Medico Teknon in Barcelona. Provides dental care with access to full hospital facilities if needed. Located in the prestigious Teknon medical center. Experience with international patients and complex cases.', 'Carrer de Vilana, 12, Oficina 170, Centro Medico Teknon, 08022 Barcelona', 'Barcelona', 'Barcelona', '+34 660 361 603', 'vazqez@dr.teknon.es', NULL, true, false, true, false, NOW(), NOW()),

-- 7. Dr. Mc Carthy
('Dr. Mc Carthy', 'Dentists', 'English-speaking female dentist in Barcelona. Located on Carrer de Castellnou in the Tres Torres area. Provides general dentistry services to local and international patients. Convenient location near Turó Park.', 'Carrer de Castellnou, 47, baixos, 08017 Barcelona', 'Barcelona', 'Barcelona', '+34 636 312 522', NULL, NULL, true, false, true, false, NOW(), NOW()),

-- 8. Dr. Victor Van Der Giessen (English & Dutch) - Castelldefels
('Dr. Victor Van Der Giessen', 'Dentists', 'English and Dutch-speaking dentist serving Castelldefels and the Barcelona coastal area. Provides comprehensive dental care with particular expertise serving Dutch and Belgian expat communities. Located near the Renfe station for easy access. Valuable for expats living in the coastal suburbs south of Barcelona.', 'Avinguda Primer de Maig, 12, 08860 Castelldefels', 'Barcelona', 'Barcelona', '+34 936 657 708', NULL, NULL, true, false, true, false, NOW(), NOW());
