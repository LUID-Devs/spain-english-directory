-- Task 1434: Add Conesa Legal - Legal - Barcelona
-- Data entry for English-speaking legal services

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Conesa Legal - Barcelona
('Conesa Legal', 'Legal', 'Leading Barcelona law firm with over 50 years of experience specializing in employment law, labour compliance, and social security. Advises SMEs on Spanish employment laws, payroll, accounting and social security. Helps individuals with unfair dismissal and workplace harassment cases. Also provides corporate, tax, immigration, family, and civil law services. Multilingual team speaks English, Spanish, Catalan and French. Members of Aliant Law international network.', 'Avda. Diagonal 467, 6-1, 08036', 'Barcelona', 'Barcelona', '+34 932 020 256', 'info@conesalegal.com', 'https://www.conesalegal.com/en/', true, false, true, false, NOW(), NOW());
