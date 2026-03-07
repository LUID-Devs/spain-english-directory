-- Task 1628: Add Powers Abogados - Legal - Madrid
-- Data entry for Spain English Directory
-- Bilingual law firm with US native founder serving international clients

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Powers Abogados - Established 1995, bilingual Spanish-English law firm with US native founder
('Powers Abogados', 'Legal', 'Established bilingual law firm founded in 1995 by Elizabeth Powers, a US native with 17 years prior experience at Baker & McKenzie. Specializes in Commercial and Civil Law with extensive expertise serving international clients (70% of clientele are American, English, German, French and Swedish). Recognized by the US Consulate in Spain and listed in Martindale Hubbell International Directory of Lawyers. Team of 5-9 legal professionals providing legal counselling and dispute resolution services throughout Spain. Deep expertise in cross-border legal matters, property law, immigration, wills and probate, citizenship matters, and international legal issues. Personalized service with clear communication in native-level English and Spanish.', 'C/ José Abascal 44, 28003 Madrid', 'Madrid', 'Madrid', '+34 913 95 28 85', 'info@powersabogados.com', 'https://www.powersabogados.com/en/', true, true, true, false, NOW(), NOW());
