-- Task 1419: Add/Update Therapy in Barcelona - Therapists - Barcelona & Madrid
-- Award-winning English-speaking therapy practice for expats
-- Idempotent seed for repeatable environments.

UPDATE directory_entries
SET
  category = 'Therapists',
  description = 'Award-winning therapy practice specializing in Counseling, Psychology, and Family Therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
  address = 'Carrer de Paris 162-164, 3o, 1a',
  province = 'Barcelona',
  phone = '+34 644 522 369',
  email = 'info@therapyinbarcelona.com',
  website = 'https://www.therapyinbarcelona.com',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Therapy in Barcelona'
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
  'Therapy in Barcelona',
  'Therapists',
  'Award-winning therapy practice specializing in Counseling, Psychology, and Family Therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
  'Carrer de Paris 162-164, 3o, 1a',
  'Barcelona',
  'Barcelona',
  '+34 644 522 369',
  'info@therapyinbarcelona.com',
  'https://www.therapyinbarcelona.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Therapy in Barcelona'
    AND city = 'Barcelona'
);

UPDATE directory_entries
SET
  category = 'Therapists',
  description = 'Award-winning therapy practice specializing in Counseling, Psychology, and Family Therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
  address = 'Calle Fernan González, 28009',
  province = 'Madrid',
  phone = '+34 644 522 369',
  email = 'info@therapyinbarcelona.com',
  website = 'https://www.therapyinbarcelona.com',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Therapy in Barcelona'
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
  'Therapy in Barcelona',
  'Therapists',
  'Award-winning therapy practice specializing in Counseling, Psychology, and Family Therapy services in English for international adults, couples, adolescents, and families. Over 10 years of experience helping expats deal with stress, depression, anxiety, relationships, grief, and the challenges of expat life. Winner of multiple awards including Most Compassionate Expat Therapy Practice 2026 - Spain, Best International Community Mental Health Service 2026 - Spain, and Virtual Counselling Service of the Year 2025. Multilingual team of therapists offers services in English, French, German, Spanish, Portuguese, Afrikaans, Swiss German, Austrian-German, and Catalan. Free 15-minute discovery calls available. Offers both in-office sessions and online therapy across Spain and Europe.',
  'Calle Fernan González, 28009',
  'Madrid',
  'Madrid',
  '+34 644 522 369',
  'info@therapyinbarcelona.com',
  'https://www.therapyinbarcelona.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Therapy in Barcelona'
    AND city = 'Madrid'
);
