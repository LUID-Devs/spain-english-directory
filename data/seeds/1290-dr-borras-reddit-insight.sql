-- Task 1290: Dr Borras Reddit Insight - Enhanced Provider Data
-- Schema-compatible variant for current directory_entries table.
-- Keeps enrichment from Reddit/community research while avoiding legacy columns/tables.

UPDATE directory_entries
SET
  category = 'Healthcare',
  description = 'Highly recommended English-speaking general practitioner in Madrid. US-trained physician with 20+ years experience serving the expat community. Frequently recommended by BEDA participants and international residents. Specializes in general practice, family medicine, preventive care, routine check-ups, acute illness care, chronic disease management, health certificates, and expat healthcare navigation. Known for clear English communication, familiarity with international prescriptions, and practical care coordination for students and families.',
  address = 'Calle Padilla 20, Bajo Derecha, 28006 Madrid',
  province = 'Madrid',
  phone = '+34 915 759 834',
  email = 'dr.rvborras@gmail.com',
  website = NULL,
  speaks_english = true,
  is_featured = true,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name IN ('Dr Ruben Borras', 'Dr Rubén Borrás')
  AND city = 'Madrid';

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
  is_featured,
  is_verified,
  is_claimed,
  created_at,
  updated_at
)
SELECT
  'Dr Rubén Borrás',
  'Healthcare',
  'Highly recommended English-speaking general practitioner in Madrid. US-trained physician with 20+ years experience serving the expat community. Frequently recommended by BEDA participants and international residents. Specializes in general practice, family medicine, preventive care, routine check-ups, acute illness care, chronic disease management, health certificates, and expat healthcare navigation. Known for clear English communication, familiarity with international prescriptions, and practical care coordination for students and families.',
  'Calle Padilla 20, Bajo Derecha, 28006 Madrid',
  'Madrid',
  'Madrid',
  '+34 915 759 834',
  'dr.rvborras@gmail.com',
  NULL,
  true,
  true,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name IN ('Dr Ruben Borras', 'Dr Rubén Borrás')
    AND city = 'Madrid'
);

-- Secondary office entry
UPDATE directory_entries
SET
  category = 'Healthcare',
  description = 'Secondary office location for Dr. Rubén Borrás in Madrid''s Salamanca area. Same English-speaking general practice support for expats and international students, including routine consultations and coordinated follow-up care.',
  address = 'Calle Núñez de Balboa 107, Office 005, 28006 Madrid',
  province = 'Madrid',
  phone = '+34 666 847 988',
  email = 'dr.rvborras@gmail.com',
  website = NULL,
  speaks_english = true,
  is_featured = true,
  is_verified = false,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Dr Rubén Borrás (Núñez de Balboa Office)'
  AND city = 'Madrid';

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
  is_featured,
  is_verified,
  is_claimed,
  created_at,
  updated_at
)
SELECT
  'Dr Rubén Borrás (Núñez de Balboa Office)',
  'Healthcare',
  'Secondary office location for Dr. Rubén Borrás in Madrid''s Salamanca area. Same English-speaking general practice support for expats and international students, including routine consultations and coordinated follow-up care.',
  'Calle Núñez de Balboa 107, Office 005, 28006 Madrid',
  'Madrid',
  'Madrid',
  '+34 666 847 988',
  'dr.rvborras@gmail.com',
  NULL,
  true,
  true,
  false,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Dr Rubén Borrás (Núñez de Balboa Office)'
    AND city = 'Madrid'
);
