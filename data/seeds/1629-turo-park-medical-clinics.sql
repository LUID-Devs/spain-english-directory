-- Task 1629: Add Turó Park Medical Clinics - Medical - Barcelona
-- Data entry by Larry
-- Note: Turó Park Medical Clinics has physical locations in Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Turó Park Medical Center - Barcelona (Main Location)
('Turó Park Medical Center', 'Healthcare', 'Private medical center in the Sarriá-Sant Gervasi district of Barcelona providing comprehensive healthcare services in English. Over 25 medical specialties including general medicine, pediatrics, gynecology, cardiology, dermatology, nutrition, infectious diseases, travel medicine, and ENT. All doctors, nurses and administrative staff speak fluent English. On-site clinical laboratory services including biochemistry, microbiology, hematology, immunology and genetics. Works with major international insurance companies. Multilingual team also speaks Spanish, French, Italian, Dutch and Catalan. Available 7 days a week including holidays.', 'Plaça de Sant Gregori Taumaturg, 5, 08021 Barcelona', 'Barcelona', 'Barcelona', '+34 932 529 729', 'contact@turoparkmedical.com', 'https://turoparkmedical.com', true, true, true, false, NOW(), NOW()),

-- Turó Park Dental Clinic - Barcelona
('Turó Park Dental Clinic', 'Dental', 'Modern dental clinic in Barcelona Sarriá-Sant Gervasi district offering comprehensive dental care in English. Services include general dentistry, pediatric dentistry, cosmetic dentistry, orthodontics, endodontics, periodontics, implants, and maxillofacial surgery. English-speaking dentists and staff with state-of-the-art digital technology including 3D imaging and intraoral scanners. Multilingual team speaks English, Spanish, French and other languages. Flexible appointment scheduling with emergency services available.', 'Carrer Francesc Pérez Cabrero, 19, 08021 Barcelona', 'Barcelona', 'Barcelona', '+34 932 529 729', 'contact@turoparkmedical.com', 'https://turoparkmedical.com', true, true, true, false, NOW(), NOW());
