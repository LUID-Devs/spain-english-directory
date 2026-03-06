-- Task 1325: Add English-Speaking-Doctor.es - Healthcare - Online/Spain
-- Data entry for doug
-- Online English doctor consultations and prescriptions service

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- English-Speaking-Doctor.es - Online Consultation Service
('English-Speaking-Doctor.es', 'Healthcare', 'Online English-speaking doctor consultation service providing medical care and prescriptions across Spain. Cost-effective alternative to in-person visits, offering convenient remote consultations with English-speaking doctors. Services include general medical consultations, prescriptions valid at Spanish pharmacies, medical certificates, and follow-up care. Ideal for expats, tourists, and international residents who prefer English-speaking healthcare providers. No physical clinic visits required - consultations conducted entirely online via video or phone. Professional and efficient service designed specifically for the English-speaking community in Spain.', 'Online service - serves all Spain', 'Online', 'Spain', NULL, NULL, 'https://english-speaking-doctor.es/', true, false, true, false, NOW(), NOW());
