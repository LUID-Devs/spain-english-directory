-- Task 1691: Add Digital Nomad Co-Living Spaces - Barcelona
-- Data entry by subagent

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Aticco Living
('Aticco Living', 'Realtors', 'Coliving brand in Barcelona offering flexible stays for digital nomads with community events, shared amenities, and fully furnished rooms. English-speaking team supports move-in, contracts, and local onboarding.', 'Various locations, Barcelona', 'Barcelona', 'Barcelona', NULL, NULL, 'https://aticcoliving.com', true, false, false, false, NOW(), NOW()),

-- Innomads Coliving
('Innomads Coliving', 'Realtors', 'International coliving operator with Barcelona locations designed for remote workers. Provides private rooms, coworking-friendly common areas, and a community program in English for digital nomads.', 'Various locations, Barcelona', 'Barcelona', 'Barcelona', NULL, NULL, 'https://www.innomads.co', true, false, false, false, NOW(), NOW()),

-- Live It Coliving Barcelona
('Live It Coliving Barcelona', 'Realtors', 'Community-focused coliving spaces in Barcelona with flexible contracts, shared kitchens, and events for expats and digital nomads. English-speaking support for reservations and onboarding.', 'Various locations, Barcelona', 'Barcelona', 'Barcelona', NULL, NULL, 'https://liveitcoliving.com', true, false, false, false, NOW(), NOW()),

-- Outsite Barcelona
('Outsite Barcelona', 'Realtors', 'Coliving and remote-work stay operator offering short and medium-term accommodation for digital nomads. English-first booking support with community-focused amenities.', 'Various locations, Barcelona', 'Barcelona', 'Barcelona', NULL, NULL, 'https://www.outsite.co', true, false, false, false, NOW(), NOW());
