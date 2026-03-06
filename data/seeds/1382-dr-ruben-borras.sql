-- Task 1382: Add Dr Ruben Borras - GP - Madrid
-- Data entry by Plankton
-- Source: Saint Louis University Madrid official healthcare directory (primary), r/Madrid Reddit recommendations
-- English-speaking confirmation: Fully bilingual, U.S.-trained physician

-- Insert the enhanced entry for Dr Ruben Borras
INSERT INTO directory_entries (
  name, 
  category, 
  description, 
  address, 
  city, 
  province, 
  phone, 
  email, 
  website, 
  speaks_english, 
  english_level,
  insurance_accepted,
  specialties,
  is_featured, 
  is_verified, 
  is_claimed,
  created_at, 
  updated_at
) VALUES (
  'Dr Ruben Borras', 
  'Healthcare', 
  'Highly recommended English-speaking GP in Madrid with 20+ years experience serving the expat community. Fully bilingual, U.S.-trained general practitioner with perfect English fluency. Official healthcare provider for Saint Louis University Madrid. Popular with BEDA program participants, English teachers, and international residents. Known for understanding US/Spanish pharmaceutical differences and coordinating with international insurance. Provides comprehensive general practice services including primary care, routine check-ups, chronic disease management, allergy treatment, and preventive care. Easily accessible via Avenida de América metro station (Line 6).', 
  'Calle Núñez de Balboa, 107 - Office 005', 
  'Madrid', 
  'Madrid', 
  '+34 666 847 988', 
  'dr.rvborras@gmail.com', 
  NULL, 
  true, 
  'native',
  '[]',
  '["General Practice", "Family Medicine", "Primary Care"]',
  true, 
  true, 
  false,
  NOW(), 
  NOW()
);
