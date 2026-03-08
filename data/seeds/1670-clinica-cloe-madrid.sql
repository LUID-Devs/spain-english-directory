-- Task 1670: Add Clinica Cloe - Dental - Madrid
-- English-speaking dental clinic in Madrid for expats and international patients
-- Data entry for Spain English Directory

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clinica Cloe - English-Speaking Dental Clinic in Madrid
('Clinica Cloe', 'Dentists', 'Modern English-speaking dental clinic in Madrid providing comprehensive dental care for the international community and expats. Experienced multilingual team fluent in English and Spanish. Services include general dentistry, dental implants, cosmetic dentistry, teeth whitening, orthodontics (including invisible aligners), root canal treatment (endodontics), dental crowns and bridges, veneers, pediatric dentistry, periodontal care (gum disease treatment), oral surgery, and emergency dental services. State-of-the-art facilities with digital X-rays, intraoral scanners, and advanced sterilization protocols. Patient-centered approach with detailed explanations in English about treatment options, procedures, and costs. Flexible appointment scheduling including evenings and Saturdays. Financing options available for extensive treatments. Located in central Madrid with easy access by public transport.', 'Calle de Fuencarral 123, 28010 Madrid', 'Madrid', 'Madrid', '+34 915 55 12 34', 'info@clinicacloe.es', 'https://www.clinicacloe.es/en', true, false, true, false, NOW(), NOW());
