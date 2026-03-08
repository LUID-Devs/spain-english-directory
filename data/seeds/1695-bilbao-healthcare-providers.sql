-- Task 1695: Add Bilbao English-Speaking Healthcare Providers
-- Data entry by subagent
-- Focus: private hospitals and clinics with English-speaking support in Bilbao area
-- Idempotent seed for repeatable environments.

UPDATE directory_entries
SET
  category = 'Hospitals',
  description = 'Private hospital serving the Bilbao metro area with multilingual staff and international patient services. Offers a full range of medical and surgical specialties, advanced diagnostics, and 24/7 emergency care for expats and international residents.',
  address = 'Carretera de Leioa-Unbe 33, 48950 Erandio',
  province = 'Biscay',
  phone = '+34 944 00 70 00',
  email = 'info@quironsalud.es',
  website = 'https://www.quironsalud.es',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Hospital Quirónsalud Bizkaia'
  AND city = 'Bilbao';

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
  'Hospital Quirónsalud Bizkaia',
  'Hospitals',
  'Private hospital serving the Bilbao metro area with multilingual staff and international patient services. Offers a full range of medical and surgical specialties, advanced diagnostics, and 24/7 emergency care for expats and international residents.',
  'Carretera de Leioa-Unbe 33, 48950 Erandio',
  'Bilbao',
  'Biscay',
  '+34 944 00 70 00',
  'info@quironsalud.es',
  'https://www.quironsalud.es',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Hospital Quirónsalud Bizkaia'
    AND city = 'Bilbao'
);

UPDATE directory_entries
SET
  category = 'Medical Clinics',
  description = 'Private clinic in Bilbao with English-speaking specialists and modern facilities. Provides outpatient consultations, diagnostic services, and specialist care for international residents in the Basque Country.',
  address = 'Ballets Olaeta Kalea 4, 48014 Bilbao',
  province = 'Biscay',
  phone = '+34 944 09 00 00',
  email = 'info@imq.es',
  website = 'https://www.imq.es',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'IMQ Zorrotzaurre Klinika'
  AND city = 'Bilbao';

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
  'IMQ Zorrotzaurre Klinika',
  'Medical Clinics',
  'Private clinic in Bilbao with English-speaking specialists and modern facilities. Provides outpatient consultations, diagnostic services, and specialist care for international residents in the Basque Country.',
  'Ballets Olaeta Kalea 4, 48014 Bilbao',
  'Bilbao',
  'Biscay',
  '+34 944 09 00 00',
  'info@imq.es',
  'https://www.imq.es',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'IMQ Zorrotzaurre Klinika'
    AND city = 'Bilbao'
);

UPDATE directory_entries
SET
  category = 'Medical Clinics',
  description = 'IMQ-affiliated clinic in central Bilbao offering general and specialist healthcare services for expats. English-speaking staff support appointments, diagnostics, and treatment planning for international patients.',
  address = 'Maestro Mendiri 2, 48006 Bilbao',
  province = 'Biscay',
  phone = '+34 944 70 80 00',
  email = 'info@imq.es',
  website = 'https://www.imq.es',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Clínica Virgen Blanca'
  AND city = 'Bilbao';

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
  'Clínica Virgen Blanca',
  'Medical Clinics',
  'IMQ-affiliated clinic in central Bilbao offering general and specialist healthcare services for expats. English-speaking staff support appointments, diagnostics, and treatment planning for international patients.',
  'Maestro Mendiri 2, 48006 Bilbao',
  'Bilbao',
  'Biscay',
  '+34 944 70 80 00',
  'info@imq.es',
  'https://www.imq.es',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Clínica Virgen Blanca'
    AND city = 'Bilbao'
);
