-- Task 1695: Add Bilbao English-Speaking Healthcare Providers
-- Data entry by subagent
-- Focus: private hospitals and clinics with English-speaking support in Bilbao area

DELETE FROM directory_entries
WHERE name IN (
  'Hospital Quirónsalud Bizkaia',
  'IMQ Zorrotzaurre Klinika',
  'Clínica Virgen Blanca'
)
AND city = 'Bilbao';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Hospital Quirónsalud Bizkaia
('Hospital Quirónsalud Bizkaia', 'Medical Clinics', 'Private hospital serving the Bilbao metro area with multilingual staff and international patient services. Offers a full range of medical and surgical specialties, advanced diagnostics, and 24/7 emergency care for expats and international residents.', 'Carretera de Leioa-Unbe 33, 48950 Erandio', 'Bilbao', 'Biscay', '+34 944 00 70 00', 'info@quironsalud.es', 'https://www.quironsalud.es', true, false, true, false, NOW(), NOW()),

-- IMQ Zorrotzaurre Klinika
('IMQ Zorrotzaurre Klinika', 'Medical Clinics', 'Private clinic in Bilbao with English-speaking specialists and modern facilities. Provides outpatient consultations, diagnostic services, and specialist care for international residents in the Basque Country.', 'Ballets Olaeta Kalea 4, 48014 Bilbao', 'Bilbao', 'Biscay', '+34 944 09 00 00', 'info@imq.es', 'https://www.imq.es', true, false, true, false, NOW(), NOW()),

-- Clínica Virgen Blanca (IMQ)
('Clínica Virgen Blanca', 'Medical Clinics', 'IMQ-affiliated clinic in central Bilbao offering general and specialist healthcare services for expats. English-speaking staff support appointments, diagnostics, and treatment planning for international patients.', 'Maestro Mendiri 2, 48006 Bilbao', 'Bilbao', 'Biscay', '+34 944 70 80 00', 'info@imq.es', 'https://www.imq.es', true, false, true, false, NOW(), NOW());
