-- Task 1559: Add Valencia Lawyers (VL Abogados) - Legal - Valencia
-- Data entry for Spain English Directory
-- English-speaking legal firm established 2002

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Valencia Lawyers (VL Abogados) - Valencia
('Valencia Lawyers (VL Abogados)', 'Legal', 'English-speaking legal firm established in 2002 with a team of English-speaking Spanish lawyers serving expats and international clients throughout the Valencian Community and Spain. Comprehensive legal services include property purchase and sales, rental contracts, Spanish wills and inheritance, NIE numbers, residency and immigration law, family law, business and corporate law, contract law, and litigation. Specialized expertise in expat legal matters with clear communication in English throughout the legal process. Personalized service with deep understanding of both Spanish and international legal needs.', 'Plaza del Ayuntamiento 12, 6º-6a, 46002', 'Valencia', 'Valencia', NULL, NULL, 'https://www.valencialawyers.com', true, false, false, false, NOW(), NOW());
