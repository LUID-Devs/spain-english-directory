-- Task 1727: Add Valencia Legal Group - Lawyers - Valencia
-- English-speaking law firm in Valencia specializing in expat legal services

DELETE FROM directory_entries
WHERE name = 'Valencia Legal Group'
AND city = 'Valencia';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Valencia Legal Group - International law firm serving expats
('Valencia Legal Group', 'Lawyers', 'International law firm in Valencia providing expert legal services in English for expats and foreign residents. Specializes in Spanish immigration law, property conveyancing, contract law, business formation, tax consulting, and estate planning. The multilingual team includes native English-speaking lawyers who understand both Spanish and international legal systems. Offers personalized consultations with clear explanations of Spanish legal processes, helping expats navigate residency applications, property purchases, business setups, and tax obligations. Provides transparent pricing and ongoing support for long-term clients.', 'Carrer de Colón, 32, 5º, 46004 Valencia', 'Valencia', 'Valencia', '+34 963 52 89 14', 'contact@valencialegalgroup.es', 'https://www.valencialegalgroup.es', true, false, true, false, NOW(), NOW());
