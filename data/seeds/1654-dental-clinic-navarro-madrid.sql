-- Task 1654: Add Dental Clinic Navarro - Dental - Madrid
-- Dental Clinic Navarro provides dental services in Madrid for English-speaking patients

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dental Clinic Navarro - English-speaking dental clinic in Madrid
('Dental Clinic Navarro', 'Dental', 'Dental Clinic Navarro offers comprehensive dental services in Madrid for English-speaking patients and expats. The clinic provides a full range of dental treatments including general dentistry, dental implants, orthodontics, cosmetic dentistry, teeth whitening, root canal treatment, periodontal care, and oral surgery. With English-speaking staff and dentists, international patients can communicate comfortably about their dental health needs. The clinic uses modern dental technology and follows international standards of care.', 'Calle de Serrano, 28006 Madrid', 'Madrid', 'Madrid', '+34 915 630 203', 'info@dentalnavarro.com', 'https://www.dentalnavarro.com', true, false, true, false, NOW(), NOW());
