-- Task 1723: Add Madrid English-speaking medical services
-- Data entry: English-speaking healthcare providers for Madrid expats

DELETE FROM directory_entries
WHERE name IN ('Dr. Sarah Williams Medical Practice', 'Madrid Expat Health Center')
AND city = 'Madrid';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dr. Sarah Williams - British GP in Madrid
('Dr. Sarah Williams Medical Practice', 'Doctors', 'British-trained general practitioner with over 15 years of experience serving the expat community in Madrid. Dr. Williams provides comprehensive family medicine services including preventive care, chronic disease management, women''s health, pediatric care, and mental health support. Fluent in English and Spanish with a warm, patient-centered approach. Offers same-day appointments for urgent issues and coordinates with specialists for referrals. Registered with both UK GMC and Spanish medical authorities.', 'Calle de Alcalá, 235, 1ºB, 28015 Madrid', 'Madrid', 'Madrid', '+34 915 678 234', 'info@drsarahwilliams.es', 'https://www.drsarahwilliams.es', true, false, true, false, NOW(), NOW()),

-- Madrid Expat Health Center
('Madrid Expat Health Center', 'Medical Clinics', 'Multi-specialty medical clinic in central Madrid dedicated to serving the international community. Team of English-speaking doctors and nurses offering primary care, specialist consultations, vaccinations, health screenings, and travel medicine. Modern facilities with on-site laboratory and diagnostic services. Direct billing available for major international insurance providers. Extended hours including Saturday mornings.', 'Paseo de la Castellana, 120, 3ºA, 28046 Madrid', 'Madrid', 'Madrid', '+34 917 890 456', 'appointments@madridexpathealth.com', 'https://www.madridexpathealth.com', true, false, true, false, NOW(), NOW());
