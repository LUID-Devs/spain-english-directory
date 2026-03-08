-- Task 1701: Add Costa Psychology (Anastasia Shironina) - English-Speaking Psychologist - Málaga
-- Idempotent seed for repeatable environments.

UPDATE directory_entries
SET
  category = 'Mental Health',
  description = 'English-speaking psychologist in Málaga offering in-person and online therapy for adults, adolescents, and children. Licensed psychologist (University of Málaga, Col. AO08692) with over 8 years of experience supporting the expat community on the Costa del Sol. Provides individual, child/adolescent, and family therapy with evidence-based approaches. Sessions available in English, Spanish, and Russian.',
  address = 'Calle Canales 10, Oficina A, 29002 Málaga',
  province = 'Málaga',
  phone = '+34 665 114 589',
  email = 'info@costapsychology.com',
  website = 'https://costapsychology.com/',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Costa Psychology (Anastasia Shironina)'
  AND city = 'Málaga';

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
  'Costa Psychology (Anastasia Shironina)',
  'Mental Health',
  'English-speaking psychologist in Málaga offering in-person and online therapy for adults, adolescents, and children. Licensed psychologist (University of Málaga, Col. AO08692) with over 8 years of experience supporting the expat community on the Costa del Sol. Provides individual, child/adolescent, and family therapy with evidence-based approaches. Sessions available in English, Spanish, and Russian.',
  'Calle Canales 10, Oficina A, 29002 Málaga',
  'Málaga',
  'Málaga',
  '+34 665 114 589',
  'info@costapsychology.com',
  'https://costapsychology.com/',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Costa Psychology (Anastasia Shironina)'
    AND city = 'Málaga'
);
