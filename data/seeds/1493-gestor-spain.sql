-- Task 1493: Add Gestor Spain - Tax/Accounting/Gestor - Nationwide
-- Data entry for English-speaking gestoria service

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES
('Gestor Spain', 'Tax/Accounting', 'English-speaking gestoria service helping expats navigate Spanish bureaucracy. Services include tax affairs, business setup, town hall visits, vehicle transfers, and NIE/TIE assistance. Nationwide remote service.', 'Remote service - Nationwide coverage', 'Madrid', 'Madrid', NULL, NULL, 'https://gestorspain.com/', true, false, true, false, NOW(), NOW());
