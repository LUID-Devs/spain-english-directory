-- Task 1479: Add 32Dental - Dental - Madrid
-- Data entry by subagent
-- English-speaking dental clinic specializing in surgery, implants, and orthodontics in Madrid

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- 32Dental - English-Speaking Dental Clinic in Madrid
('32Dental', 'Dentists', 'English-speaking dental clinic in Madrid specializing in surgery, implantology, and orthodontics. Multidisciplinary team offering comprehensive dental care including emergency dental services, endodontics, cosmetic dentistry, and video consultations for patients abroad or unable to travel. Fully English-speaking staff with experience treating international patients and expats. Modern facilities with personalized care approach. Open Saturdays by appointment and available for dental emergencies outside regular hours.', 'C/ de Marcenado, 32', 'Madrid', 'Madrid', '+34 911 38 59 28', 'info@32dental.es', 'https://32dental.es', true, false, true, false, NOW(), NOW());
