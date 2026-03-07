-- Task 1489: Refresh Sanz Pancko Dental listing - Barcelona
-- Update existing row first; insert only if missing.

UPDATE directory_entries
SET
  category = 'Dentists',
  description = 'Sanz Pancko Dental is a Barcelona clinic in El Clot founded by Dr. Javier Sanz and Dr. Nancy Pancko. The clinic provides general dentistry, implants, orthodontics, periodontics, endodontics, prosthodontics, pediatric dentistry, and cosmetic treatments.',
  address = 'C/ Rogent 40-42 local 2, 08026 Barcelona',
  province = 'Barcelona',
  phone = '+34 932 469 043',
  email = 'info@clinicadentalsyp.com',
  website = 'https://www.clinicadentalsyp.com',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Sanz Pancko Dental'
  AND city = 'Barcelona';

INSERT INTO directory_entries (
  name, category, description, address, city, province,
  phone, email, website, speaks_english, is_featured, is_verified,
  is_claimed, created_at, updated_at
)
SELECT
  'Sanz Pancko Dental',
  'Dentists',
  'Sanz Pancko Dental is a Barcelona clinic in El Clot founded by Dr. Javier Sanz and Dr. Nancy Pancko. The clinic provides general dentistry, implants, orthodontics, periodontics, endodontics, prosthodontics, pediatric dentistry, and cosmetic treatments.',
  'C/ Rogent 40-42 local 2, 08026 Barcelona',
  'Barcelona',
  'Barcelona',
  '+34 932 469 043',
  'info@clinicadentalsyp.com',
  'https://www.clinicadentalsyp.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries
  WHERE name = 'Sanz Pancko Dental'
    AND city = 'Barcelona'
);
