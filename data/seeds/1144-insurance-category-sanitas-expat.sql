-- Task 1144: Add Insurance Category + Sanitas Expat Provider
-- Data entry by Cletus
-- Includes: New Insurance category with Sanitas Expat provider

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Sanitas Expat - Health Insurance for Expats in Spain
('Sanitas Expat', 'Insurance', 'Health insurance for expats in Spain. Part of the Sanitas/Bupa group, specializing in comprehensive health coverage for international residents, visa applicants, and those seeking residency status. Policies underwritten by Bupa International. Services include medical, dental, and preventive care with extensive network of English-speaking doctors and specialists across Spain. Full assistance in English for policy management, claims, and customer support. Online quote system available with fast response times Monday-Friday.', 'Avenida de España 8, Rincón del Mar Local 2, Urb. Sitio de Calahonda, 29649 Mijas-Costa', 'Málaga', 'Málaga', '+34 951 273 444', 'info@sanitasexpat.com', 'https://www.sanitasexpat.com', true, true, true, false, NOW(), NOW());
