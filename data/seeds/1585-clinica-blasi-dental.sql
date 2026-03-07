-- Task 1585: Add Clínica Blasi - Dental - Barcelona
-- Data entry by doug
-- English-speaking dental clinic in Sarrià-Sant Gervasi, Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Blasi - English-Speaking Dental Clinic in Sarrià-Sant Gervasi
('Clínica Blasi', 'Dentists', 'Established in 1991 by Dr. José Ignacio Blasi, Clínica Blasi is a family-run dental clinic with over 25 years of experience serving Barcelona. Located in the Sarrià-Sant Gervasi district, the clinic offers comprehensive dental care with fully English-speaking dentists and staff. Specialties include dental implants, oral surgery, orthodontics, dental prostheses, periodontics, and endodontics. Known for professional, personalized treatment based on trust, with a multidisciplinary team providing patient-centered care for both local and international patients.', 'Carrer de Muntaner 341, 3º 3ª', 'Barcelona', 'Barcelona', '+34 934 146 404', 'info@clinicablasi.com', 'https://clinicablasi.com/en/', true, true, true, false, NOW(), NOW());
