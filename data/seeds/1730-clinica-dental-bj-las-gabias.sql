-- Task 1730: Add Clínica Dental B&J (Las Gabias) - Dental - Granada
-- English-speaking dental clinic in Las Gabias, Granada province

DELETE FROM directory_entries
WHERE name = 'Clínica Dental B&J'
AND city = 'Las Gabias';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Dental B&J (Las Gabias)
('Clínica Dental B&J', 'Dentists', 'English-speaking dental clinic in Las Gabias, Granada, offering general and preventive dentistry for expats and international residents. Provides clear treatment communication in English and Spanish, with services including routine check-ups, hygiene care, restorative dentistry, cosmetic dentistry, and emergency dental support.', 'Calle Real de Málaga, 33, 18110 Las Gabias', 'Las Gabias', 'Granada', '+34 958 58 41 26', NULL, NULL, true, false, true, false, NOW(), NOW());
