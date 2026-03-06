-- Task 1490: Add Marfour Law - Legal - Barcelona/Madrid
-- Data entry for English-speaking legal services for expats

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Marfour International Law Firm - Barcelona (Main Office)
('Marfour International Law Firm', 'Legal', 'International law firm founded by Maryem Essadik specializing in Spanish Immigration, Real Estate, Corporate and Tax Law for expats. Multilingual team speaks English, Spanish, French, Arabic, Turkish, and Russian. Services include visa applications (Golden Visa, Non-Lucrative, Digital Nomad, Entrepreneur, Student, Work visas), property conveyancing, company formation, tax planning, Spanish citizenship applications, family reunification, and legal representation for appeals. Registered with the Barcelona Bar Association (ICAB 45.125). Also serves clients in Madrid area. Personalized attention with video consultations available.', 'C/ de Bailèn, 36, 4º 2ª Izda, 08010', 'Barcelona', 'Barcelona', '+34 698 917 840', 'info@marfourlaw.com', 'https://marfourlaw.com', true, false, true, false, NOW(), NOW());
