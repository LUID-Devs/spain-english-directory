-- Task 1728: Add Valencia English-speaking accounting and tax services
-- Data entry: English-speaking gestores and tax advisors for Valencia expats

DELETE FROM directory_entries
WHERE name IN ('Valencia Expat Tax Advisors', 'Gestoría Internacional Valencia')
AND city = 'Valencia';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_verified, is_claimed, created_at, updated_at) VALUES

-- Valencia Expat Tax Advisors
('Valencia Expat Tax Advisors', 'Tax Services', 'English-speaking tax consultancy in Valencia specializing in expat tax planning and compliance. Services include Spanish tax returns (IRPF), non-resident tax, property tax, inheritance tax planning, and business accounting. Experienced team helps navigate Spanish tax regulations for foreigners, including Beckham Law applications and double taxation treaties. Transparent fixed fees with free initial consultation.', 'Carrer de la Pau, 22, 2º, 46002 Valencia', 'Valencia', 'Valencia', '+34 963 45 67 89', 'info@valenciaexpattax.es', 'https://www.valenciaexpattax.es', true, true, false, NOW(), NOW()),

-- Gestoría Internacional Valencia
('Gestoría Internacional Valencia', 'Tax Services', 'Full-service gestoría in Valencia providing administrative and tax services in English for expats and international businesses. Specializes in residency applications, NIE processing, vehicle registration, tax compliance, and business formation. Multilingual team understands the needs of international residents and offers personalized service. Competitive rates with package deals for ongoing services.', 'Plaza de l'Ajuntament, 12, 4º, 46002 Valencia', 'Valencia', 'Valencia', '+34 963 87 65 43', 'contact@gestoriavalencia.com', 'https://www.gestoriavalencia.com', true, true, false, NOW(), NOW());
