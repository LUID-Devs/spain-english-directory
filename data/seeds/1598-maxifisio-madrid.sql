-- Task 1598: Add Maxifisio - Physiotherapy - Madrid
-- Data entry by subagent
-- Source: https://maxifisio.com/en
-- English-speaking physiotherapy clinic in Madrid (El Viso area)

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Maxifisio - English-speaking physiotherapy clinic founded by Maria "Maxi" Moreno
('Maxifisio', 'Physiotherapy', 'English-speaking physiotherapy clinic founded by Maria "Maxi" Moreno, a physiotherapist since 2005 with over 19 years of clinical experience. Maria worked in London from 2007 until mid-2018 and was part of the clinical team at APPI (The Australian Physiotherapy and Pilates Institute). Services include physiotherapy, online physiotherapy consultations, Pilates (equipment and mat), Yoga (Hatha Vinyasa), Hypopressives, and Personal Training. Specialises in rehabilitation and functional recovery, sports injuries, Women''s Health, prenatal and postnatal care, dry needling, and Kinesiotaping. Also offers ergonomic assessments. All sessions are 55 minutes by pre-booking only. Located in the El Viso area of Madrid, near Cruz del Rayo metro station. Services available both in-studio and online.', 'Calle Francisco Campos 12, 28002 Madrid', 'Madrid', 'Madrid', NULL, NULL, 'https://maxifisio.com/', true, false, true, false, NOW(), NOW());
