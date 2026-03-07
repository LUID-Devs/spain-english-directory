-- Task 1575: Add Nerja Medical Center - Telemedicine - Valencia
-- Data entry by Cletus
-- Source: https://www.nerjamedicalcenter.es/english-speaking-doctor-valencia/

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Nerja Medical Center - Online Telemedicine Service for Valencia
('Nerja Medical Center (Valencia)', 'Healthcare', 'English-speaking telemedicine service providing online video and telephone medical consultations for Valencia residents and visitors. Native English-speaking doctors Dr. Ben and Dr. Julie offer convenient healthcare from the comfort of your home or hotel. Medical consultation price: €39. Digital prescriptions sent directly to your smartphone or email within minutes, valid at any pharmacy in Valencia. Treats common medical issues including UTI, ear problems, fever, chest infections, pain management, tonsillitis, skin conditions, eye irritation, and sleeping problems. Also provides evaluations for weight loss injections (Wegovy/Mounjaro). Available Monday to Sunday, 9:00 AM to 5:00 PM. Phone and WhatsApp support available for general inquiries. Connected to a network of medical centers and hospitals if further treatment is needed.', 'Telemedicine - Online Consultations', 'Valencia', 'Valencia', '+34 622 09 45 54', NULL, 'https://www.nerjamedicalcenter.es/english-speaking-doctor-valencia/', true, false, true, false, NOW(), NOW());
