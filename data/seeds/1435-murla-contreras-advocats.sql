-- Task 1435: Add/Update Murlà & Contreras Advocats - Legal - Barcelona
-- Idempotent seed for repeatable environments.

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'English-speaking law firm specializing in immigration law. Help immigrants take advantage of opportunities in Barcelona. Extensive knowledge of local bureaucracy for both EU and non-EU citizens. Assist with residence cards, NIE numbers, work permits, and visa applications. Also specialize in animal law. Highly specialized professionals with an international outlook and academic research focus. Personalized legal services with dedicated attention to each case.',
  address = 'C/ Diputació, 305, 4-4B, 08009',
  province = 'Barcelona',
  phone = '+34 935 11 30 62',
  email = 'info@murlacontreras.com',
  website = 'https://murlacontreras.com/en/home/',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Murlà & Contreras Advocats'
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
  'Murlà & Contreras Advocats',
  'Legal',
  'English-speaking law firm specializing in immigration law. Help immigrants take advantage of opportunities in Barcelona. Extensive knowledge of local bureaucracy for both EU and non-EU citizens. Assist with residence cards, NIE numbers, work permits, and visa applications. Also specialize in animal law. Highly specialized professionals with an international outlook and academic research focus. Personalized legal services with dedicated attention to each case.',
  'C/ Diputació, 305, 4-4B, 08009',
  'Barcelona',
  'Barcelona',
  '+34 935 11 30 62',
  'info@murlacontreras.com',
  'https://murlacontreras.com/en/home/',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Murlà & Contreras Advocats'
    AND city = 'Barcelona'
);
