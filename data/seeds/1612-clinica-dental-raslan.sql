-- Task 1612: Add Clínica Dental Raslan - Dental - Barcelona
-- Data entry for issue #1612
-- English-speaking dental clinic with 24-hour emergency services in Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Dental Raslan - English-Speaking Dental Clinic with 24h Emergency
('Clínica Dental Raslan', 'Dentists', 'English-speaking dental clinic in Barcelona offering comprehensive dental care with 24-hour emergency services. Led by Dr. Mansur Raslan and a multidisciplinary team providing conservative dentistry, orthodontics, implantology, endodontics, cosmetic dentistry, and emergency dental care. Fully English-speaking staff with services also available in Spanish and Catalan. Experienced in treating international patients and expats with modern facilities and patient-centered care. Equipped with the latest technology for dental implants, orthodontics, and dental aesthetics.', 'C/ Ganduxer 59 Bis / Tetuán, 16, 08010 Barcelona', 'Barcelona', 'Barcelona', '+34 937 656 788', 'info@clinicaraslan.com', 'https://clinicaraslan.com/en/', true, false, true, false, NOW(), NOW());
