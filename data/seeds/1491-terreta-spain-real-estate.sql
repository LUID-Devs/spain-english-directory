-- Task 1491: Add Terreta Spain - Real Estate - Madrid/Valencia
-- Data entry for English-speaking real estate services for expats

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Terreta Spain - Madrid
('Terreta Spain', 'Real Estate', 'English-speaking real estate agency serving Madrid and Valencia. Specializes in property purchase, sale, renovation, interior design, and rental management for international buyers and expats. Multilingual team with expat-focused support.', 'Multiple locations - Madrid & Valencia', 'Madrid', 'Madrid', NULL, NULL, 'https://terretaspain.com/en/', true, false, true, false, NOW(), NOW()),

-- Terreta Spain - Valencia
('Terreta Spain', 'Real Estate', 'English-speaking real estate agency serving Madrid and Valencia. Specializes in property purchase, sale, renovation, interior design, and rental management for international buyers and expats. Multilingual team with expat-focused support.', 'Multiple locations - Madrid & Valencia', 'Valencia', 'Valencia', NULL, NULL, 'https://terretaspain.com/en/', true, false, true, false, NOW(), NOW());
