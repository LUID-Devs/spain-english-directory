-- Task 1465: Add INTERCLINIC Madrid - Medical Group - Madrid
-- INTERCLINIC is a large medical group in Madrid with English-speaking doctors and multiple specialties

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- INTERCLINIC Madrid - Medical Group
('INTERCLINIC Madrid', 'Doctors', 'International medical center in Madrid with English-speaking doctors across multiple specialties. Large medical group serving the expat and international community with comprehensive healthcare services. Offers general practice, specialists, and coordinated care for English-speaking patients.', 'Calle Claudio Coello, 117, Bajo Dcha, 28006 Madrid', 'Madrid', 'Madrid', '+34 915 769 901', NULL, 'https://www.interclinic.es/', true, false, true, false, NOW(), NOW());
