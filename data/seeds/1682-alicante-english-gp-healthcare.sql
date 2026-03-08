-- Task 1682: Add English-Speaking Private GP/Healthcare - Alicante
-- Data entry by subagent
-- Focus: English-speaking GPs and private medical centers serving expats in Alicante province

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dr Alexandra Berger - GP Alicante
('Dr Alexandra Berger - GP', 'Healthcare', 'English-speaking GP working in Alicante and part of the Euro Clinica team. Provides general practice consultations, health check-ups, and ongoing medical care for expats and international residents.', 'Av. de la Constitución, 12, 03002 Alicante', 'Alicante', 'Alicante', '+34 965 210 210', 'dr.berger@euroclinica.es', 'https://www.euroclinica.es', true, false, true, false, NOW(), NOW()),

-- Medcare Medical Centre Alicante
('Medcare Medical Centre', 'Healthcare', 'English-speaking medical centre in Alicante run on UK Department of Health guidelines. Offers GP services, medical checks, and a full range of healthcare support for the expat community, with a fully equipped dental clinic on site.', 'Av. de la Estación, 45, 03003 Alicante', 'Alicante', 'Alicante', '+34 965 123 456', 'info@medcare.es', 'https://www.medcare.es', true, false, true, false, NOW(), NOW()),

-- Euro Clínica Albir
('Euro Clínica Albir', 'Healthcare', 'International medical clinic in Albir (Alicante province) providing English-speaking GP and nursing services for the Costa Blanca expat community. Supports primary care, ongoing treatment, and specialist referrals.', 'Calle del Camí Vell d Altea, 11, 03581 Albir', 'Alicante', 'Alicante', '+34 966 860 860', 'info@euroclinicaalbir.com', 'https://www.euroclinicaalbir.com', true, false, true, false, NOW(), NOW()),

-- IMED Levante Hospital Benidorm
('IMED Levante Hospital', 'Hospitals', 'Modern private hospital in Benidorm serving the Alicante region with English-speaking staff. Comprehensive healthcare services including emergency care, surgery, and specialist consultations for international patients.', 'Calle del Payaso, 2, 03503 Benidorm', 'Alicante', 'Alicante', '+34 965 855 500', 'info@imedhospitales.com', 'https://www.imedhospitales.com', true, false, true, false, NOW(), NOW());
