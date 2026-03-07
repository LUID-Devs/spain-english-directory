-- Task 1557: Add GP in Madrid - Telemedicine/GP - Madrid
-- English-speaking telemedicine service providing same-day GP video consultations
-- Data entry by Chip
-- Source: https://gpinmadrid.com

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- GP in Madrid - English-speaking telemedicine service
('GP in Madrid', 'Medical Clinics', 'English-speaking telemedicine service providing same-day private GP video consultations for tourists and expats in Madrid. Connect with NHS-trained English-speaking doctors via smartphone, tablet, or computer from the comfort of your accommodation. Consultation costs €149 including free prescription if needed (medication costs extra at pharmacy). Simple 3-step process: book online, see GP on video, receive prescription in your inbox. All doctors are English or speak excellent English, ensuring clear communication. Prescriptions are valid at ANY Spanish pharmacy. Led by Dr Adam Abbs (MBBS, mRCGP), a leader in digital health and former Clinical Director at Medicspot, and Dr Huber Cubillos (MD), a GP with global telemedicine experience. No insurance required - pay a one-off fee by credit/debit card. Ideal for UK tourists and international visitors needing urgent medical care, prescription renewals, or medical advice while in Madrid.', 'Online Service (Madrid coverage)', 'Madrid', 'Madrid', NULL, NULL, 'https://gpinmadrid.com', true, true, true, false, NOW(), NOW());
