-- Task 1433/1586: Add International Doctor 24h - Medical Clinics - Madrid
-- Data entry by subagent
-- 24/7 English-speaking doctors in Madrid for tourists. Urgent care and medical services with walk-in clinics and home doctor visits.

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- International Doctor 24h - 24/7 English-speaking doctors in Madrid
('International Doctor 24h', 'Medical Clinics', '24/7 English-speaking doctors in Madrid providing urgent care and medical services for tourists. Home doctor visits and walk-in clinic access available across Madrid including Chamberí, La Latina, Moncloa-Aravaca, Salamanca, Sol, Gran Vía, Malasaña, Barajas Airport, and more. Services include urgent care, pediatricians, family doctors, emergency room assistance, and ambulance coordination. No appointment needed - contact by phone or WhatsApp for immediate assistance. Home doctor visits available 24 hours for hotel and Airbnb guests. Accepts international and private medical insurance. Home visit price: €150. English-speaking medical professionals ensure you understand your diagnosis and treatment.', 'Madrid city center and surrounding areas', 'Madrid', 'Madrid', '+34 678 752 098', 'info@internationaldoctor24h.com', 'https://internationaldoctor24h.com', true, true, true, false, NOW(), NOW());
