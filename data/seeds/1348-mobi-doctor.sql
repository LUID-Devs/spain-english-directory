-- Task 1348: Add Mobi Doctor - Online Healthcare - Madrid
-- Data entry for Spain English Directory
-- Online healthcare service providing English-speaking doctor consultations

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Mobi Doctor - Online Healthcare Service for Madrid
('Mobi Doctor', 'Healthcare', 'Online telemedicine platform providing instant access to English-speaking doctors for Madrid residents and visitors. Consultations cost only €24 with no waiting times - connect with a licensed physician via smartphone, tablet, or PC in minutes. Services include urgent care, general medical consultations, prescriptions (valid at Spanish pharmacies), medical advice, and treatment for everyday health concerns. Available 24/7 from anywhere in Spain - whether at home, in a hotel, or traveling. No local registration required. Ideal for expats, tourists, and international residents seeking convenient, English-speaking healthcare without visiting a physical clinic. All doctors are licensed and experienced in treating international patients.', 'Online service - Available throughout Madrid', 'Madrid', 'Madrid', NULL, NULL, 'https://www.mobidoctor.eu/doctors/madrid', true, false, true, false, NOW(), NOW());
