-- Task 1722: Add Madrid English-speaking dental services
-- Data entry: English-speaking dental clinics for Madrid expats

DELETE FROM directory_entries
WHERE name IN ('Madrid Dental Care', 'Smile Studio Madrid')
AND city = 'Madrid';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Madrid Dental Care
('Madrid Dental Care', 'Dentists', 'Modern dental clinic in central Madrid providing comprehensive dental services for the international community. English-speaking dentists and staff offer general dentistry, cosmetic procedures, dental implants, orthodontics, and emergency dental care. State-of-the-art facilities with digital X-rays and 3D imaging technology. Flexible appointment scheduling with evening and Saturday hours available. Direct billing with major international insurance providers.', 'Calle de Goya, 85, 1ºB, 28001 Madrid', 'Madrid', 'Madrid', '+34 914 35 67 89', 'info@madriddentalcare.es', 'https://www.madriddentalcare.es', true, false, true, false, NOW(), NOW()),

-- Smile Studio Madrid
('Smile Studio Madrid', 'Dentists', 'Premium dental clinic in Madrid\'s Salamanca district specializing in cosmetic and restorative dentistry for expats. US-trained dentist with over 12 years of experience treating international patients. Services include teeth whitening, veneers, dental implants, Invisalign, and full smile makeovers. Modern clinic with comfortable amenities and English-speaking staff. Personalized treatment plans with transparent pricing.', 'Calle de Serrano, 45, 2ºA, 28006 Madrid', 'Madrid', 'Madrid', '+34 915 23 45 67', 'appointments@smilestudiomadrid.com', 'https://www.smilestudiomadrid.com', true, false, true, false, NOW(), NOW());
