-- Task 1648: Add Engel & Völkers Spain - Luxury Real Estate - Multi-City
-- Data entry for Engel & Völkers Spain (national headquarters)
-- Coverage: Madrid, Barcelona, Valencia, Costa del Sol, Costa Blanca, Ibiza, Mallorca, Canary Islands

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Engel & Völkers Spain - Global Luxury Real Estate Brand
('Engel & Völkers Spain', 'Real Estate', 'Global luxury real estate brand with 1,000+ locations across 35+ countries. Premium segment focus specializing in high-end residential and commercial properties throughout Spain including Madrid, Barcelona, Valencia, Costa del Sol, Costa Blanca, Ibiza, Mallorca, and the Canary Islands. Comprehensive services include property sales, purchases, rentals, valuations, and investment advisory. International client base with English-speaking agents providing local market expertise backed by a worldwide network. Expert guidance for expats and international buyers seeking luxury properties in Spain.', 'Calle de Serrano, 92', 'Madrid', 'Madrid', '+34 900 878 888', 'spain@engelvoelkers.com', 'https://www.engelvoelkers.com/en-es/spain/', true, true, true, true, NOW(), NOW());
