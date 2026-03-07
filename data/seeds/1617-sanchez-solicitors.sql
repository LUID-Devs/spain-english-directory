-- Task 1617: Add Sánchez Solicitors - Legal - Nerja/Málaga/Marbella/Fuengirola
-- Data entry for Spain English Directory
-- English-speaking law firm with offices across Costa del Sol

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Sánchez Solicitors - Main Nerja office
('Sánchez Solicitors', 'Legal', 'Established English-speaking law firm serving the Costa del Sol with offices in Nerja, Marbella, and Fuengirola. Founded in 2011, the firm specializes in property law and conveyancing, inheritance and probate law, wills and testament planning, divorce and family law, and non-resident income tax matters. Professional team of 10-50 staff provides comprehensive legal services tailored to English-speaking expats and international clients. Multilingual services available in English and Spanish with deep expertise in Spanish legal system complexities. Committed to client-focused solutions with clear communication throughout the legal process.', 'Calle Diputación Provincial, 13', 'Nerja', 'Málaga', '+34 951 21 46 36', 'info@sanchezsolicitors.com', 'https://www.sanchezsolicitors.com/', true, false, true, false, NOW(), NOW()),

-- Sánchez Solicitors - Marbella office
('Sánchez Solicitors', 'Legal', 'Marbella office of established English-speaking law firm serving the Costa del Sol. Specializes in property law and conveyancing, inheritance and probate law, wills and testament planning, divorce and family law, and non-resident income tax matters. Professional team provides comprehensive legal services tailored to English-speaking expats and international clients with deep expertise in Spanish legal system complexities. Clear communication in English throughout the legal process.', 'Marbella', 'Marbella', 'Málaga', '+34 952 43 10 04', 'info@sanchezsolicitors.com', 'https://www.sanchezsolicitors.com/', true, false, true, false, NOW(), NOW()),

-- Sánchez Solicitors - Fuengirola office
('Sánchez Solicitors', 'Legal', 'Fuengirola office of established English-speaking law firm serving the Costa del Sol. Specializes in property law and conveyancing, inheritance and probate law, wills and testament planning, divorce and family law, and non-resident income tax matters. Professional team provides comprehensive legal services tailored to English-speaking expats and international clients with deep expertise in Spanish legal system complexities. Clear communication in English throughout the legal process.', 'Fuengirola', 'Fuengirola', 'Málaga', '+34 952 91 90 93', 'info@sanchezsolicitors.com', 'https://www.sanchezsolicitors.com/', true, false, true, false, NOW(), NOW());
