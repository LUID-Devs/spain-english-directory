-- Task 1465: Add INTERCLINIC Madrid - Medical Group - Madrid
-- INTERCLINIC is a large medical group in Madrid with English-speaking doctors and multiple specialties
-- Made idempotent: refresh existing row, insert only when missing.

UPDATE directory_entries
SET
  category = 'Doctors',
  description = 'International medical center in Madrid with English-speaking doctors across multiple specialties. Large medical group serving the expat and international community with comprehensive healthcare services. Multiple locations throughout Madrid with main center at Paseo de la Habana. Offers general practice, specialists, and coordinated care for English-speaking patients.',
  address = 'Paseo de la Habana, 38, 28036 Madrid',
  province = 'Madrid',
  phone = '+34 917 877 770',
  email = NULL,
  website = 'https://www.interclinic.es/',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'INTERCLINIC Madrid' AND city = 'Madrid';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'INTERCLINIC Madrid',
  'Doctors',
  'International medical center in Madrid with English-speaking doctors across multiple specialties. Large medical group serving the expat and international community with comprehensive healthcare services. Multiple locations throughout Madrid with main center at Paseo de la Habana. Offers general practice, specialists, and coordinated care for English-speaking patients.',
  'Paseo de la Habana, 38, 28036 Madrid',
  'Madrid',
  'Madrid',
  '+34 917 877 770',
  NULL,
  'https://www.interclinic.es/',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'INTERCLINIC Madrid' AND city = 'Madrid'
);
