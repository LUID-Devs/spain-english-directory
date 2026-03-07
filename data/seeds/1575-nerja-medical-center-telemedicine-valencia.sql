-- Task 1575: Add Nerja Medical Center - Telemedicine - Valencia
-- Data entry by Larry
-- Source: https://www.nerjamedicalcenter.es/english-speaking-doctor-valencia/

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Nerja Medical Center - Telemedicine Service for Valencia
('Nerja Medical Center - Valencia Telemedicine', 'Doctors', 'Online video and telephone medical consultation service for Valencia residents and visitors. Native English and Swedish-speaking medical team led by Dr. Ben and Dr. Julie provides professional GP and emergency doctor consultations from the comfort of your home or hotel. Medical consultation price: €39. Digital prescriptions valid across all of Valencia sent directly to your smartphone or email within minutes. Easy and secure online booking available. Connected to a large network of medical centers and hospitals if further exploration is needed. Services include treatment for UTI, ear issues, fever, chest infections, STI, pain medication, tonsillitis, skin issues, eye irritation, and sleeping problems. Available Monday to Sunday, 09:00 to 17:00. No more waiting rooms - most medical issues can be resolved over phone or video chat.', 'Online Telemedicine Service - Valencia', 'Valencia', 'Valencia', NULL, NULL, 'https://www.nerjamedicalcenter.es/english-speaking-doctor-valencia/', true, true, true, false, NOW(), NOW());
