-- Task 1626: Add Spain Lawyer (Spainlawyer.com) - Legal - Madrid
-- Data entry for Spain English Directory
-- English-speaking legal services provider in Madrid

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Spain Lawyer - English-speaking legal services in Madrid
('Spain Lawyer', 'Legal', 'English-speaking law firm based in Madrid specializing in Spanish property law, residency and visa applications, inheritance and wills, and business formation. Provides comprehensive legal services tailored to expats and international clients moving to or investing in Spain. Offers clear communication in English with experienced lawyers who understand both Spanish and international legal systems. Personalized approach with transparent fee structures and dedicated client support throughout all legal processes.', 'Madrid', 'Madrid', 'Madrid', NULL, NULL, 'https://spainlawyer.com/', true, false, false, false, NOW(), NOW());
