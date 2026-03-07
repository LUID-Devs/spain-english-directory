-- Task 1406: Add Mobidoctor - Online Healthcare - Madrid
-- Online telemedicine service providing English-speaking doctors via video consultation
-- Data entry for Madrid location

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Mobidoctor - Madrid (Online Healthcare/Telemedicine)
('Mobidoctor', 'Medical Clinics', 'English-speaking online healthcare service providing video consultations with experienced doctors in Madrid. Connect via smartphone, tablet, or computer for urgent care and primary care without the wait. Consultations available daily from 7:00 AM to 11:00 PM, including Sundays. Services include general medical consultations, prescriptions, medical certificates (Fit to Fly, sick notes), and urgent care. Digital prescriptions are valid across the EU and can be filled at any pharmacy. Transparent pricing with no hidden charges. No local insurance required. Confidential and secure platform with data protection. Ideal for expats, tourists, and international residents seeking convenient English-speaking medical care in Madrid.', 'Online Service (Madrid coverage)', 'Madrid', 'Madrid', NULL, NULL, 'https://www.mobidoctor.eu', true, true, true, false, NOW(), NOW());
