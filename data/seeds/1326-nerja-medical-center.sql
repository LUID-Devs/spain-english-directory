-- Task 1326: Add Nerja Medical Center - Healthcare - Madrid/Málaga
-- Data entry by Chip
-- Source: Business owner submission
-- Website: https://www.nerjamedicalcenter.es/english-speaking-doctor-madrid/

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Nerja Medical Center - English-speaking doctors in Madrid/Málaga area
('Nerja Medical Center', 'Healthcare', 'English-speaking medical center with native English-speaking doctors Dr Ben and Dr Julie. Specializes in providing healthcare services to English-speaking expats and visitors in the Madrid and Málaga areas. Dr Ben and Dr Julie are both native English speakers, ensuring clear communication for English-speaking patients. Consultations available at €39. 24-hour service offered for urgent medical needs.', 'Madrid/Málaga area', 'Madrid', 'Madrid', NULL, NULL, 'https://www.nerjamedicalcenter.es/english-speaking-doctor-madrid/', true, false, false, false, NOW(), NOW());
