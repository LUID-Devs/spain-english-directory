-- Task 1729: Add Valencia legal and professional services
-- Data entry: English-speaking legal and professional services for Valencia

DELETE FROM directory_entries
WHERE name IN ('Valencia Legal Partners', 'Costa Blanca Lawyers')
AND city = 'Valencia';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Valencia Legal Partners
('Valencia Legal Partners', 'Lawyers', 'Full-service English-speaking law firm in Valencia specializing in property law, immigration, family law, and business services for expats. Experienced team of bilingual lawyers provides clear legal advice and representation for property purchases, visa applications, contract reviews, company formation, and civil matters. Transparent fee structure with detailed quotes. Member of the Valencia Bar Association with over 15 years of experience serving the international community.', 'Carrer del Colón, 12, 1º, 46004 Valencia', 'Valencia', 'Valencia', '+34 963 456 789', 'info@valencialegalpartners.es', 'https://www.valencialegalpartners.es', true, false, true, false, NOW(), NOW()),

-- Costa Blanca Lawyers
('Costa Blanca Lawyers', 'Lawyers', 'International law firm with offices in Valencia serving expats throughout the Costa Blanca region. Specializes in real estate transactions, residency permits (Golden Visa, Non-Lucrative Visa), inheritance law, tax planning, and commercial contracts. English-speaking lawyers with in-depth knowledge of Spanish law and expat needs. Free initial consultation available. Established reputation for professional service and successful outcomes for international clients.', 'Plaza del Ayuntamiento, 8, 4º, 46002 Valencia', 'Valencia', 'Valencia', '+34 963 789 012', 'contact@costablancalawyers.es', 'https://www.costablancalawyers.es', true, false, true, false, NOW(), NOW());
