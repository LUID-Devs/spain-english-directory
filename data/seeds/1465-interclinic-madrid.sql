-- Task 1465: Add INTERCLINIC Madrid - Medical Group - Madrid
-- Data entry for Spain English Directory
-- Source: Spain Expat (https://spainexpat.com/information/doctors-in-spain)

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- INTERCLINIC Madrid - English-speaking medical group directed by Dr. Manuel Cid
('INTERCLINIC Madrid', 'Doctors', 'English-speaking medical clinic in Madrid directed by Dr. Manuel Cid. Provides general practice and medical specialties for expats and international residents. Offers comprehensive healthcare services with English-speaking doctors and staff. Office hours: Monday-Friday, 9:00-18:30. Experienced in treating international patients and working with various insurance providers.', 'Calle Claudio Cuello, 117, Bajo Dcha, 28006 Madrid', 'Madrid', 'Madrid', '+34 915 769 901', NULL, NULL, true, false, false, false, NOW(), NOW());
