-- Task 1382: Add Dr Ruben Borras - GP - Madrid
-- Data entry by Cletus
-- Source: r/Madrid, r/SpainAuxiliares Reddit recommendations (Task 1290)
-- Note: This enhances the previous Task 1280 entry with additional details

-- Update the existing entry with enhanced fields (preserves primary key and created_at)
UPDATE directory_entries SET
  description = 'Highly recommended English-speaking GP in Madrid with 20+ years experience serving the expat community. US-trained general practitioner with perfect English fluency. Popular with BEDA program participants, English teachers, and international residents. Known for understanding US/Spanish pharmaceutical differences and coordinating with international insurance. House calls available in Madrid city center. Frequently recommended on Reddit for quality care and excellent communication.',
  address = 'Calle Padilla 20, Bajo Derecha',
  phone = '+34 915 759 834',
  speaks_english = true,
  english_level = 'native',
  insurance_accepted = '[]',
  specialties = '["General Practice", "Family Medicine", "House Calls"]',
  is_featured = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Dr Ruben Borras' AND city = 'Madrid';

-- If no row was updated (entry doesn't exist), insert new
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
)
SELECT 
  'Dr Ruben Borras', 
  'General Practice', 
  'Highly recommended English-speaking GP in Madrid with 20+ years experience serving the expat community. US-trained general practitioner with perfect English fluency. Popular with BEDA program participants, English teachers, and international residents. Known for understanding US/Spanish pharmaceutical differences and coordinating with international insurance. House calls available in Madrid city center. Frequently recommended on Reddit for quality care and excellent communication.', 
  'Calle Padilla 20, Bajo Derecha', 
  'Madrid', 
  'Madrid', 
  '+34 915 759 834', 
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
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'Dr Ruben Borras' AND city = 'Madrid'
);
