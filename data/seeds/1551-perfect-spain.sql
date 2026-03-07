-- Task 1551: Add Perfect Spain Real Estate - Valencia
-- Data entry for Perfect Spain real estate agency in Valencia

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Perfect Spain - Personal real estate firm specializing in English-speaking clients
('Perfect Spain', 'Real Estate', 'Small personal real estate firm based in the Old City (Casco Antiguo) of Valencia, specializing in English-speaking clients. With 25 years of experience on three continents, they offer personalized service for property sales, rentals (short, medium, and long-term), and relocation services. Multilingual team speaks Spanish, English, Swedish, French, Italian, Russian, and Estonian. Comprehensive services include area tours, rental assistance, school search, legal advice, immigration and visa support, and temporary living coordination. Additional concierge services include holiday packages, event planning, Formula 1 packages, airport pickup, flight and car rental discounts, guided tours, and bicycle tours. Serves multinational companies, professional sports teams, retirees, and families.', 'Calle Alta 70', 'Valencia', 'Valencia', '+34 628 293 163', 'info@perfectspain.com', 'https://perfectspain.com', true, false, true, false, NOW(), NOW());
