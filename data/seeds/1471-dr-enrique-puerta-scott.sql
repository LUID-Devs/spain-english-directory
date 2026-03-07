-- Task 1471: Add Dr. Enrique Puerta Scott - Doctors - Madrid
-- Data entry for English-speaking GP in Madrid
-- Made idempotent: refresh existing row, insert only when missing.

UPDATE directory_entries
SET
  category = 'Doctors',
  description = 'English-speaking general practitioner in Madrid with home-visit availability and long-standing experience serving international residents. Provides primary care consultations, routine assessments, and referral support for expat patients navigating the Spanish healthcare system.',
  address = 'Edificio Britannia, 9-D, C/ Guzman el Bueno, 133, 28003 Madrid',
  province = 'Madrid',
  phone = '+34 915 343 251',
  email = NULL,
  website = NULL,
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Dr. Enrique Puerta Scott' AND city = 'Madrid';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'Dr. Enrique Puerta Scott',
  'Doctors',
  'English-speaking general practitioner in Madrid with home-visit availability and long-standing experience serving international residents. Provides primary care consultations, routine assessments, and referral support for expat patients navigating the Spanish healthcare system.',
  'Edificio Britannia, 9-D, C/ Guzman el Bueno, 133, 28003 Madrid',
  'Madrid',
  'Madrid',
  '+34 915 343 251',
  NULL,
  NULL,
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'Dr. Enrique Puerta Scott' AND city = 'Madrid'
);
