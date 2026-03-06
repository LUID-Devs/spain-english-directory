-- Task 1363: Add Conesa Legal - Legal - Barcelona
-- Data entry for English-speaking legal services

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Conesa Legal - Barcelona
('Conesa Legal', 'Legal', 'Leading law firm in Barcelona with over 50 years of experience. Specializes in employment law, corporate law, social security, tax, and civil law, tailoring each strategy to the needs of businesses and individuals. Offers comprehensive legal advisory services including labour consultancy, business consulting, immigration law, family law (divorce, inheritance), criminal defense, and litigation. Multilingual support available in Spanish, Catalan, English, and French. Combines empathy with rigor, working collaboratively to anticipate risks and maximise opportunities. Member of Aliant Law - International network of lawyers.', 'Avda. Diagonal 467, 6-1, 08036', 'Barcelona', 'Barcelona', '+34 932 020 256', 'info@conesalegal.com', 'https://www.conesalegal.com/en/', true, false, false, false, NOW(), NOW());
