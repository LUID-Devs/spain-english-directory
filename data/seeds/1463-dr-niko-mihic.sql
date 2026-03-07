-- Task 1463: Add Dr. Niko Mihic - General Practitioner - Madrid
-- English-speaking GP, accepts international patients, central Madrid location
-- Source: Expat recommendations + health directories
-- Added: March 6, 2026
-- Made idempotent: refresh existing row, insert only when missing.

UPDATE directory_entries
SET
  category = 'Doctors',
  description = 'English-speaking general practitioner in central Madrid. Dr. Niko Mihic provides primary care services for the international community and accepts international patients. Located in the heart of Madrid, easily accessible for expats and visitors seeking English-speaking medical care in the city center.',
  address = 'C/ de Sagasta, 31, 28004 Madrid',
  province = 'Madrid',
  phone = '+34 915 947 219',
  email = NULL,
  website = NULL,
  speaks_english = true,
  is_featured = false,
  is_verified = false,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Dr. Niko Mihic' AND city = 'Madrid';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'Dr. Niko Mihic',
  'Doctors',
  'English-speaking general practitioner in central Madrid. Dr. Niko Mihic provides primary care services for the international community and accepts international patients. Located in the heart of Madrid, easily accessible for expats and visitors seeking English-speaking medical care in the city center.',
  'C/ de Sagasta, 31, 28004 Madrid',
  'Madrid',
  'Madrid',
  '+34 915 947 219',
  NULL,
  NULL,
  true,
  false,
  false,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'Dr. Niko Mihic' AND city = 'Madrid'
);
