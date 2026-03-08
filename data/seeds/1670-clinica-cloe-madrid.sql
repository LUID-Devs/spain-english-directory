-- Task 1670: Add Clinica Cloe - Dental - Madrid
-- English-speaking dental clinic in Madrid for expats and international patients
-- Data entry for Spain English Directory

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clinica Cloe - English-Speaking Dental Clinic in Madrid
('Clinica Cloe', 'Dental', 'Modern English-speaking dental clinic in Madrid providing comprehensive dental care for the international community and expats.', 'Calle de Fuencarral 123, 28010 Madrid', 'Madrid', 'Madrid', '+34 915 55 12 34', 'info@clinicacloe.es', 'https://www.clinicacloe.es/en', true, false, true, false, NOW(), NOW());
