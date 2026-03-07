-- Task 1630: Add Mobi Doctor - Telemedicine - Madrid
-- Data entry for Spain English Directory
-- Source: Spain English Directory submission

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Mobi Doctor - Telemedicine Service for Madrid
('Mobi Doctor', 'Telemedicine', 'English-speaking online medical consultation service for expats in Madrid. Mobi Doctor provides convenient telemedicine consultations with qualified doctors via video call. Services include general medical consultations, prescription services, medical certificates, and urgent care consultations. Perfect for expats seeking accessible English-speaking healthcare from the comfort of their home. Online appointments available with quick access to medical professionals who understand the needs of international residents in Spain.', 'Online Service (Madrid coverage)', 'Madrid', 'Madrid', NULL, NULL, 'https://mobidoctor.eu', true, true, true, false, NOW(), NOW());
