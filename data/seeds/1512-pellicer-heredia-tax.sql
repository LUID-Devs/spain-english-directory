-- Task 1512: Add/Update Pellicer & Heredia Tax Advisors - Alicante

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'Pellicer & Heredia Tax Advisors is a bilingual advisory firm in Alicante focused on tax and legal support for expats, digital nomads, and non-residents. Services include personal and corporate tax planning, real-estate taxation, inheritance and wealth tax support, and immigration-related legal guidance.',
  address = 'Alicante office (exact street address pending verification)',
  province = 'Alicante',
  phone = '+34 965 480 737',
  email = 'info@pellicerheredia.com',
  website = 'https://www.pellicerheredia.com/en/',
  speaks_english = true,
  is_verified = false,
  updated_at = NOW()
WHERE name = 'Pellicer & Heredia Tax Advisors'
  AND city = 'Alicante';

INSERT INTO directory_entries (
  name, category, description, address, city, province,
  phone, email, website, speaks_english,
  is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'Pellicer & Heredia Tax Advisors',
  'Legal',
  'Pellicer & Heredia Tax Advisors is a bilingual advisory firm in Alicante focused on tax and legal support for expats, digital nomads, and non-residents. Services include personal and corporate tax planning, real-estate taxation, inheritance and wealth tax support, and immigration-related legal guidance.',
  'Alicante office (exact street address pending verification)',
  'Alicante',
  'Alicante',
  '+34 965 480 737',
  'info@pellicerheredia.com',
  'https://www.pellicerheredia.com/en/',
  true,
  false,
  false,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Pellicer & Heredia Tax Advisors'
    AND city = 'Alicante'
);
