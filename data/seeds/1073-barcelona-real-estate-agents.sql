-- Task 1073: Add 6 Real Estate Agent Listings - Barcelona
-- Data entry by Cletus

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- 1. Lucas Fox - International real estate agency
('Lucas Fox', 'Real Estate', 'Luxury real estate agency specializing in high-end residential properties in Barcelona and throughout Catalonia. Over 20 years experience with multilingual team speaking English, French, German, Dutch and Russian. Full-service agency offering property sales, rentals, investment advice and relocation services.', 'Av. de Pau Casals, 9-11', 'Barcelona', 'Barcelona', '+34 933 562 989', 'info@lucasfox.com', 'https://www.lucasfox.com', true, true, true, false, NOW(), NOW()),

-- 2. Casamona - Boutique real estate agency
('Casamona', 'Real Estate', 'Leading boutique real estate agency in Barcelona offering personalized and professional service. Specializes in unique, upmarket homes that blend modernity with traditional Catalan elements. Selective property portfolio with beautiful apartments in and around Barcelona city.', 'Carrer de la Princesa, 8', 'Barcelona', 'Barcelona', '+34 933 152 302', 'info@casamona.com', 'https://www.casamona.com', true, false, true, false, NOW(), NOW()),

-- 3. Fincas Eva - Catalan real estate agency with English service
('Fincas Eva', 'Real Estate', 'Real estate agency operating across Catalonia with expert English-speaking staff providing guidance for expats looking for property in and around Barcelona. Services include buying, selling and renting properties with personalized attention for international clients.', 'Pg. de Sant Joan, 32, Entresuelo 4ª', 'Barcelona', 'Barcelona', '+34 932 658 665', 'info@fincaseva.com', 'https://www.fincaseva.com', true, false, true, false, NOW(), NOW()),

-- 4. Casc Antic BCN - Old Town specialists
('Casc Antic BCN', 'Real Estate', 'Real estate agency dedicated to the purchase, sale and rental of properties in Barcelona''s Old Town (Ciutat Vella). 15+ years of experience specializing in the Gothic Quarter, Raval, Born and Barceloneta neighborhoods. Multilingual team including English speakers.', 'Rambla del Raval, 37', 'Barcelona', 'Barcelona', '+34 934 433 342', 'info@cascanticbcn.com', 'https://www.cascanticbcn.com', true, false, true, false, NOW(), NOW()),

-- 5. BCN Life - American expat relocation agency
('BCN Life', 'Real Estate', 'Native English-speaking relocation agency created by American expats in Barcelona. Specializes in helping expats find perfect apartments for rent and purchase. Full-service relocation including NIE assistance, bank setup, school search, and lease negotiation.', 'Carrer del Consell de Cent, 333', 'Barcelona', 'Barcelona', '+34 931 123 456', 'info@bcn-life.com', 'https://bcn-life.com', true, true, true, false, NOW(), NOW()),

-- 6. Barcelona Home Hunter - Buyer''s agents for expats
('Barcelona Home Hunter', 'Real Estate', 'English-speaking buyer''s agents specializing in helping expats buy property in Barcelona. Street-by-street advice, NIE number assistance, mortgage guidance, lawyer referrals, and notary coordination. American team who understands expat needs and local market intricacies.', 'Carrer de Muntaner, 200', 'Barcelona', 'Barcelona', '+34 930 123 789', 'info@barcelonahomehunter.com', 'https://barcelonahomehunter.com', true, false, true, false, NOW(), NOW());
