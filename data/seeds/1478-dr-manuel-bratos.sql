-- Task 1478: Add Dr. Manuel Bratos - Dental - Madrid
-- Data entry by Rupert
-- English-speaking dental clinic with international experience in Madrid

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dr. Manuel Bratos - English-Speaking Dental Clinic
('Dr. Manuel Bratos - Clínica Dental Bratos', 'Dentists', 'English-speaking dental clinic in Madrid serving local and international patients. Clínica Dental Bratos provides general dentistry, implants, prosthodontics, orthodontics, pediatric dentistry, and preventive care with multilingual patient support for expats.', 'Avenida El Ferrol 18, 1º-4', 'Madrid', 'Madrid', '+34 913 233 380', NULL, 'https://clinicadentalbratos.es/', true, true, true, false, NOW(), NOW());
