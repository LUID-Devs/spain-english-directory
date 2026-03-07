-- Task 1636: Add Unidad Médica - Medical Clinic Madrid
-- Data entry by Cletus

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Unidad Médica Angloamericana - Private Medical Clinic Madrid
('Unidad Médica Angloamericana', 'Doctors', 'Private medical clinic in Madrid serving the English-speaking community since 1995. Over 20 medical specialties including cardiology, dermatology, gynecology, pediatrics, and general medicine. Fully bilingual team of English-speaking doctors, nurses and administrative staff. Specialists in treating international patients, expats, and families. Comprehensive healthcare with short waiting times and personalized attention. Open Monday to Friday 9am-8pm, Saturdays 10am-1pm. Accepts international insurance.', 'Calle Conde de Aranda 1, 1º Izquierda', 'Madrid', 'Madrid', '+34 914 351 823', 'info@unidadmedica.com', 'https://www.unidadmedica.com/en/', true, false, true, false, NOW(), NOW());
