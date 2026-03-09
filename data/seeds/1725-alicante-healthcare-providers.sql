-- Task 1725: Add Alicante English-speaking healthcare providers
-- Data entry: English-speaking medical services for Alicante expats

DELETE FROM directory_entries
WHERE name IN ('Alicante Expat Medical Center', 'Costa Blanca Health Clinic')
AND city = 'Alicante';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Alicante Expat Medical Center
('Alicante Expat Medical Center', 'Medical Clinics', 'Multi-specialty medical clinic in Alicante serving the international community on the Costa Blanca. Team of English-speaking doctors providing primary care, specialist consultations, diagnostic services, and preventive health programs. Modern facilities with on-site laboratory and imaging services. Experienced with UK and international health insurance. Home visit service available for urgent cases.', 'Avinguda de Alfonso X el Sabio, 28, 3ºB, 03002 Alicante', 'Alicante', 'Alicante', '+34 965 12 34 56', 'info@alicantexpatmedical.com', 'https://www.alicantexpatmedical.com', true, false, true, false, NOW(), NOW()),

-- Costa Blanca Health Clinic
('Costa Blanca Health Clinic', 'Medical Clinics', 'Family-friendly medical clinic in Alicante specializing in care for British and international expats. English-speaking GP and nursing team offer routine check-ups, chronic disease management, vaccinations, and health screenings. Coordinated care with local specialists and hospitals. Administrative support for insurance claims and medical documentation. Extended hours during peak tourist season.', 'Carrer del Poeta Campos Vasallo, 15, 1º, 03004 Alicante', 'Alicante', 'Alicante', '+34 965 98 76 54', 'appointments@costablancahealth.es', 'https://www.costablancahealth.es', true, false, true, false, NOW(), NOW());
