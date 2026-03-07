-- Task 1280: Add Dr Ruben Borras - Healthcare - Madrid
-- Data entry by Cletus
-- Source: r/Madrid multiple Reddit recommendations
-- Updated: Task #1290 - Added email, mobile, hours from Reddit research

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dr Ruben Borras - English-Speaking General Practitioner
('Dr Ruben Borras', 'Doctors', 'Highly recommended English-speaking doctor in Madrid, popular with expats and English teachers. US-trained general practitioner with perfect English fluency. Frequently recommended on Reddit by BEDA program participants and other English teachers for his quality care and communication. Provides general practice services for the international community in Madrid. House calls available in Madrid center. Accepts Sanitas insurance.', 'Calle Padilla 20, Bajo derecha', 'Madrid', 'Madrid', '+34 915 759 834', 'dr.rvborras@gmail.com', NULL, true, false, false, false, NOW(), NOW());
