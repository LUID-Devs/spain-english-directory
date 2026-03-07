-- Task 1611: Add MedinAction - House Call Doctors - Madrid/Barcelona/Malaga
-- Update existing entries with phone number and enhanced description
-- Data entry by Zeke
-- Source: https://www.medinaction.com

-- Update phone number for existing MedinAction entries
UPDATE directory_entries 
SET phone = '+39 375 572 4686',
    updated_at = NOW()
WHERE name = 'MedinAction' 
  AND city IN ('Madrid', 'Barcelona', 'Malaga', 'Marbella', 'Ibiza');

-- Insert new entries for specific house call doctor services if they don't exist
-- These complement the existing Medical Clinics entries with specific House Call Doctors category

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- MedinAction House Call Doctors - Madrid
('MedinAction - House Call Doctors', 'Doctors', 'English-speaking house call doctor service in Madrid providing medical care at your home, office, or hotel. Licensed physicians available for same-day appointments with English-speaking customer service from 9am to 8pm. Services include general medical consultations, urgent care, prescriptions, medical certificates (Fit to Fly), ECG home visits, and travel medicine. Online consultations also available 24/7. Direct billing to international insurance providers. Book via website, mobile app, WhatsApp, phone, or chat. Serving expats, tourists, and international residents throughout Madrid.', 'Madrid (House Call Service)', 'Madrid', 'Madrid', '+39 375 572 4686', 'info@medinaction.com', 'https://www.medinaction.com', true, true, true, false, NOW(), NOW()),

-- MedinAction House Call Doctors - Barcelona  
('MedinAction - House Call Doctors', 'Doctors', 'English-speaking house call doctor service in Barcelona providing medical care at your home, office, or hotel. Licensed physicians available for same-day appointments with English-speaking customer service from 9am to 8pm. Services include general medical consultations, urgent care, prescriptions, medical certificates (Fit to Fly), ECG home visits, and travel medicine. Online consultations also available 24/7. Direct billing to international insurance providers. Book via website, mobile app, WhatsApp, phone, or chat. Serving expats, tourists, and international residents throughout Barcelona.', 'Barcelona (House Call Service)', 'Barcelona', 'Barcelona', '+39 375 572 4686', 'info@medinaction.com', 'https://www.medinaction.com', true, true, true, false, NOW(), NOW()),

-- MedinAction House Call Doctors - Malaga
('MedinAction - House Call Doctors', 'Doctors', 'English-speaking house call doctor service in Malaga and Costa del Sol providing medical care at your home, office, or hotel. Licensed physicians available for same-day appointments with English-speaking customer service from 9am to 8pm. Services include general medical consultations, urgent care, prescriptions, medical certificates (Fit to Fly), ECG home visits, and travel medicine. Online consultations also available 24/7. Direct billing to international insurance providers. Book via website, mobile app, WhatsApp, phone, or chat. Serving expats, tourists, and international residents throughout Malaga and Costa del Sol.', 'Malaga (House Call Service)', 'Malaga', 'Malaga', '+39 375 572 4686', 'info@medinaction.com', 'https://www.medinaction.com', true, true, true, false, NOW(), NOW());
