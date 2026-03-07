-- Task 1652: Add Simple English Advice - Gestor/Consultancy - Malaga
-- Data entry for Spain English Directory
-- English-speaking gestor and expat consultancy in Malaga serving nationwide

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Simple English Advice - Gestor/Expat Consultancy (Malaga-based, nationwide service)
('Simple English Advice', 
 'Tax Advisors', 
 'English-speaking gestor and expat consultancy helping foreigners live, work, and settle in Spain without paperwork headaches. Offers comprehensive gestor services in English including visa and residency applications, NIE/TIE processing, autónomo registration and management, tax declarations and compliance, business formation, property purchase assistance, and general Spanish bureaucracy navigation. Based in Malaga with nationwide service coverage. Specializes in making Spanish administrative processes simple and stress-free for English-speaking expats, digital nomads, and international residents.', 
 'Malaga', 
 'Malaga', 
 'Malaga', 
 NULL, 
 NULL, 
 'https://simpleenglishadvice.com', 
 true, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW());
