-- Task 1636: Add Unidad Médica Angloamericana - Medical Clinic - Madrid
-- Data entry by Cletus
-- Note: Private multilingual medical clinic in Madrid with over 25 years of experience serving the English-speaking community

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Unidad Médica Angloamericana - Private medical clinic in Madrid
('Unidad Médica Angloamericana', 'Healthcare', 'Private multilingual medical clinic with over 25 years of experience offering bilingual medical attention to English-speaking residents in Madrid. All doctors, nurses and administrative staff speak fluent English. Covers over 20 medical specialties including Cardiology, Dermatology, Gynecology, Pediatrics, General Medicine, and more. Authorized center by the U.S. Embassy, Australian authorities, and New Zealand authorities for official visa medical examinations. Multilingual team also speaks Spanish, French and German. Offers personalized and comprehensive care with short waiting times. Open Monday-Friday 9am-8pm, Saturdays 10am-1pm. Located near Plaza de la Independencia (Puerta de Alcalá), close to Retiro and Serrano metro stations.', 'C/ Conde Aranda 1, 28001 Madrid', 'Madrid', 'Madrid', '+34 914 351 823', 'um@unidadmedica.com', 'https://www.unidadmedica.com/en/', true, false, true, false, NOW(), NOW());
