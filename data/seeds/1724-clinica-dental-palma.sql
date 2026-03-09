-- Task 1724: Add Clínica Dental Palma - Dentists - Palma de Mallorca
-- English-speaking dental clinic in Palma de Mallorca for expats and international patients

DELETE FROM directory_entries
WHERE name = 'Clínica Dental Palma'
AND city = 'Palma de Mallorca';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Dental Palma - Modern dental clinic with English-speaking staff
('Clínica Dental Palma', 'Dentists', 'Modern dental clinic in Palma de Mallorca providing comprehensive dental care with fluent English-speaking dentists and staff. Specializes in general dentistry, cosmetic dentistry, dental implants, orthodontics, and emergency dental services for expats and international residents. The clinic uses state-of-the-art technology including digital X-rays and 3D imaging. Offers personalized treatment plans with clear communication in English, ensuring comfort for international patients. Provides services from routine check-ups to complex restorative procedures with flexible appointment scheduling.', 'Avinguda Jaume III, 12, 07012 Palma de Mallorca', 'Palma de Mallorca', 'Balearic Islands', '+34 971 72 35 48', 'info@clinicadentalpalma.com', 'https://www.clinicadentalpalma.com', true, false, true, false, NOW(), NOW());
