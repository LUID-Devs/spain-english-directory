-- Task 1557: Add GP in Madrid - Telemedicine/GP - Madrid
-- Data entry by Marvin
-- Source: https://gpinmadrid.com / https://gpinspain.com

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- GP in Madrid / The Holiday Doctor - Telemedicine and In-Person GP Service
('GP in Madrid', 'Doctors', 'English-speaking telemedicine and GP service specializing in UK tourists and expats in Madrid. Founded by Dr. Adam Abbs (NHS-trained) and Dr. Huber Cubillos. Offers same-day video consultations with prescriptions valid at all Spanish pharmacies, as well as in-person visits. Transparent pricing specifically designed for tourists. Digital health focus with secure online booking and video consultations. NHS-trained doctors provide familiar, high-quality care for British visitors and residents. Services include urgent care, prescription renewals, medical certificates, travel health advice, and referrals to specialists if needed.', 'Based in Madrid - Video consultations and in-person visits available', 'Madrid', 'Madrid', NULL, 'info@gpinmadrid.com', 'https://gpinmadrid.com', true, true, true, false, NOW(), NOW());
