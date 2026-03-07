-- Task 1466: Add Dr. Santiago Dexeus - Gynecologist - Barcelona
-- Data entry for Spain English Directory
-- Made idempotent: refresh existing row, insert only when missing.

UPDATE directory_entries
SET
  category = 'Doctors',
  description = 'Renowned English-speaking gynecologist in Barcelona. Specialist in gynecological surgery, reproductive medicine, and women''s health. Part of the prestigious Dexeus Mujer medical team, one of Spain''s leading women''s health clinics. Offers comprehensive gynecological services including annual check-ups, fertility treatments, pregnancy care, and minimally invasive surgery. English-speaking staff and international patient services available.',
  address = 'Calle Sabino Arana, 9-19',
  province = 'Barcelona',
  phone = '+34 932274747',
  email = NULL,
  website = 'https://www.dexeus.com',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Dr. Santiago Dexeus' AND city = 'Barcelona';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'Dr. Santiago Dexeus',
  'Doctors',
  'Renowned English-speaking gynecologist in Barcelona. Specialist in gynecological surgery, reproductive medicine, and women''s health. Part of the prestigious Dexeus Mujer medical team, one of Spain''s leading women''s health clinics. Offers comprehensive gynecological services including annual check-ups, fertility treatments, pregnancy care, and minimally invasive surgery. English-speaking staff and international patient services available.',
  'Calle Sabino Arana, 9-19',
  'Barcelona',
  'Barcelona',
  '+34 932274747',
  NULL,
  'https://www.dexeus.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'Dr. Santiago Dexeus' AND city = 'Barcelona'
);
