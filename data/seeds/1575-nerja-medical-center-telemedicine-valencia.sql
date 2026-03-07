-- Task 1575: Add Nerja Medical Center - Telemedicine - Valencia
-- Data entry for directory
-- Source: Business owner submission
-- Website: https://www.nerjamedicalcenter.es/

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Nerja Medical Center - Telemedicine Service for Valencia
('Nerja Medical Center - Telemedicine', 'Doctors', 'English-speaking telemedicine service providing online medical consultations for Valencia residents and visitors. Led by native English-speaking doctors Dr Ben and Dr Julie, offering convenient remote healthcare without language barriers. Video consultations available for general medical issues, prescription renewals, medical certificates, and health advice. Same-day appointments often available. Consultations at €39 with 24-hour service for urgent medical needs. Ideal for expats, tourists, and digital nomads in Valencia who prefer English-speaking healthcare providers from the comfort of their accommodation.', 'Telemedicine - Online Consultations', 'Valencia', 'Valencia', NULL, NULL, 'https://www.nerjamedicalcenter.es/', true, false, false, false, NOW(), NOW());
