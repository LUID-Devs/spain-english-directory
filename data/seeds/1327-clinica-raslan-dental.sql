-- Task 1327: Add Clínica Raslan Dental - Dental - Barcelona
-- Data entry by Rupert
-- English-speaking dental clinic with 24h emergency services in Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Raslan Dental - English-Speaking Dental Clinic with 24h Emergency
('Clínica Raslan Dental', 'Dentists', 'English-speaking dental clinic in Barcelona offering comprehensive dental care with 24-hour emergency services. Multidisciplinary medical team providing conservative dentistry, orthodontics, implantology, endodontics, cosmetic dentistry, and emergency dental care. Fully English-speaking staff with services also available in Spanish and Catalan. Experienced in treating international patients and expats with modern facilities and patient-centered care.', 'Barcelona', 'Barcelona', 'Barcelona', '+34 669 154 020', NULL, 'https://clinicaraslan.com/en/', true, true, true, false, NOW(), NOW());
