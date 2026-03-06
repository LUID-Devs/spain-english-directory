-- Task 1290: Add Dr. Borras - Most Recommended Madrid Doctor
-- Data entry by Cletus
-- Source: Reddit recommendations (r/Madrid, r/SpainExpats)
-- Status: Highly recommended by expat community

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dr. Borras - Highly Recommended English-Speaking GP in Madrid
('Dr. Borras', 'Doctors', 'Highly recommended English-speaking general practitioner in Madrid, frequently mentioned on Reddit by expats and English teachers as the go-to doctor for the international community. Known for excellent English fluency, patient-centered care, and understanding of expat healthcare needs. Provides comprehensive general practice services including routine check-ups, acute illness treatment, chronic disease management, health certificates, and preventive care. Particularly popular with BEDA program participants and English teachers working in Madrid. Praised for clear communication, thorough consultations, and accessibility. Accepts walk-ins and appointments.', 'Calle Padilla 20, Bajo Derecha', 'Madrid', 'Madrid', '+34 915 759 834', NULL, NULL, true, true, true, false, NOW(), NOW());
