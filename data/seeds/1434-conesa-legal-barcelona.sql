-- Task 1434: Add Conesa Legal - Legal - Barcelona
-- Data entry for English-speaking legal services

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Conesa Legal - Barcelona
('Conesa Legal', 'Legal', 'Specializes in labour law. Advises SMEs on Spanish employment laws, payroll, accounting and social security. Helps individuals with unfair dismissal and workplace harassment cases. English-speaking team.', 'Avda. Diagonal 467, 6-1, 08036', 'Barcelona', 'Barcelona', '+34 932 020 256', 'info@conesalegal.com', 'https://www.conesalegal.com/en/', true, false, false, false, NOW(), NOW());
