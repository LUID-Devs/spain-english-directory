-- Task 1379: Add SpainEasy Real Estate - Valencia
-- Data entry for SpainEasy real estate agency

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- SpainEasy - Real estate agency for English-speaking expats
('SpainEasy', 'Real Estate', 'Real estate agency specializing in helping English-speaking expats (particularly US citizens) buy property in Valencia and throughout Spain. Full-service agency offering property search, NIE assistance, legal support, mortgage guidance, and relocation services. Multilingual team with native English speakers. They bridge the Atlantic to help clients buy safely, transparently, and efficiently with video property tours and comprehensive buyer representation.', 'Carrer dels Transits, 2 Planta 2 – local 6', 'Valencia', 'Valencia', '+34 960 136 567', 'contact@spaineasy.com', 'https://spaineasy.com', true, false, true, false, NOW(), NOW());
