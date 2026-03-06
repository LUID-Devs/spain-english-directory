-- Task 1382: Add Dr Ruben Borras - GP - Madrid
-- Data entry by Cletus
-- Source: r/Madrid, r/SpainAuxiliares Reddit recommendations (Task 1290)
-- Note: This enhances the previous Task 1280 entry with additional details

-- First, remove any existing entry to ensure clean update
DELETE FROM directory_entries WHERE name = 'Dr Ruben Borras' AND city = 'Madrid';

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
  'Highly recommended English-speaking GP in Madrid with 20+ years experience serving the expat community. US-trained general practitioner with perfect English fluency. Popular with BEDA program participants, English teachers, and international residents. Known for understanding US/Spanish pharmaceutical differences and coordinating with international insurance. House calls available in Madrid city center. Frequently recommended on Reddit for quality care and excellent communication.', 
  'Calle Padilla 20, Bajo Derecha', 
  'Madrid', 
  'Madrid', 
  '+34 674 216 899', 
  NULL, 
  NULL, 
  true, 
  'native',
  '[]',
  '["General Practice", "Family Medicine", "House Calls"]',
  true, 
  true, 
  false,
  NOW(), 
  NOW()
);
