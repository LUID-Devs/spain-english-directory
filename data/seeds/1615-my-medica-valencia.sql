-- Task 1615: Add My Medica Valencia - Medical Clinic
-- Data entry for Valencia English-speaking medical clinic
-- Source: Web research for expat healthcare directory

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- My Medica Valencia - English-speaking medical clinic in central Valencia
('My Medica Valencia', 'Medical Clinic', 'English-speaking doctors in central Valencia providing personalized treatment for over 12 specialties. Modern medical clinic focused on helping expats feeling unwell away from home. Services include: Dermatology, Gynecology, Urology, Cardiology, General Medicine, Sexual Health, and Therapy. Bilingual staff ensures clear communication for international patients. Convenient downtown location with easy access for expats living in Valencia.', 'Plaza Ayuntamiento 26, 4º, 46002 Valencia', 'Valencia', 'Valencia', '+34 963 145 000', 'info@mymedicavalencia.com', 'https://mymedicavalencia.com', true, true, true, false, NOW(), NOW());
