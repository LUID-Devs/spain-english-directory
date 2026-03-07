-- Task 1446: Add/Update English Doctor Barcelona - Healthcare - Barcelona
-- Avoid duplicate inserts if an ESHA-sourced row already exists.

UPDATE directory_entries
SET
  category = 'Healthcare',
  description = 'Private medical clinic in Barcelona providing quality healthcare services in English. Founded by Dr. Victoria Howe, offering comprehensive medical care for expats, tourists, and English-speaking residents in Barcelona. Services include general practice consultations, health check-ups, prescriptions, medical certificates, vaccinations, and referral services. Same-day appointments available with online booking system. Designed specifically for the English-speaking community seeking professional medical care without language barriers in Barcelona.',
  address = 'Carrer de l''Arquitecte Sert, 16, LOC 1, 08005 Barcelona',
  province = 'Barcelona',
  phone = '+34 662 29 11 91',
  email = 'info@englishdoctorbarcelona.com',
  website = 'https://englishdoctorbarcelona.com/',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'English Doctor Barcelona'
  AND city = 'Barcelona';

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
  'English Doctor Barcelona',
  'Healthcare',
  'Private medical clinic in Barcelona providing quality healthcare services in English. Founded by Dr. Victoria Howe, offering comprehensive medical care for expats, tourists, and English-speaking residents in Barcelona. Services include general practice consultations, health check-ups, prescriptions, medical certificates, vaccinations, and referral services. Same-day appointments available with online booking system. Designed specifically for the English-speaking community seeking professional medical care without language barriers in Barcelona.',
  'Carrer de l''Arquitecte Sert, 16, LOC 1, 08005 Barcelona',
  'Barcelona',
  'Barcelona',
  '+34 662 29 11 91',
  'info@englishdoctorbarcelona.com',
  'https://englishdoctorbarcelona.com/',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'English Doctor Barcelona'
    AND city = 'Barcelona'
);
