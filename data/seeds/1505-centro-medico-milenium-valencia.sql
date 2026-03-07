-- Task 1505: Add Centro Medico Milenium Valencia - Healthcare - Valencia
-- Data entry for Spain English Directory
-- Source: Research on English-speaking healthcare providers in Valencia

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Centro Médico Milenium Valencia - Sanitas Medical Center with English-speaking services
('Centro Médico Milenium Valencia', 'Healthcare', 'Medical center in Valencia operated by Sanitas, one of Spain''s leading health insurance providers. Offers comprehensive healthcare services with English-speaking doctors and staff for the international community. Services include general medicine with walk-in consultations, paediatrics, clinical analysis and pathology laboratory, psychology, nursing, physiotherapy, and aesthetic medicine. Extended opening hours Monday through Friday from 07:30 to 21:00 and Saturdays from 09:00 to 14:00. Adult urgent care available 08:00-20:00 and paediatric urgent care 09:00-20:00. Part of the Sanitas network, facilitating insurance coordination for international patients and expats living in Valencia.', 'Calle Antiga Senda de Senent 11, 46023 Valencia', 'Valencia', 'Valencia', '+34 963 520 907', NULL, 'https://centromedicomilenium-valencia.sanitas.es/', true, false, true, false, NOW(), NOW());
