-- Task 1437: Add KLEV&VERA Law Firm - Legal - Barcelona
-- Data entry by Squidward
-- Made idempotent: refresh existing row, insert only when missing.

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'English-speaking international law firm with 20+ years of experience serving expats and international clients in Spain. Founded by two partners with backgrounds in big law firms and international projects. Fluent in English, Spanish, Russian, and Italian. Specializes in immigration and residency (work permits, Digital Nomad visa, Non-Lucrative visa, Golden Visa), property law, business law, and all areas of Spanish law. Premium personalized service with dedicated lawyers assigned to each case. Tailor-made legal solutions with personal, direct treatment. Trusted partner of Catalonia Trade & Investment, Barcelona Chamber of Commerce, British Chamber of Commerce in Spain, Tech Barcelona, and other official organizations. Open Monday-Friday 9:00-17:00. Video consultations available.',
  address = 'C/ de València, 281, 2do, 08009',
  province = 'Barcelona',
  phone = '+34 931 760 190',
  email = 'info@klevvera.com',
  website = 'https://www.klevvera.com/',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'KLEV&VERA Law Firm' AND city = 'Barcelona';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'KLEV&VERA Law Firm',
  'Legal',
  'English-speaking international law firm with 20+ years of experience serving expats and international clients in Spain. Founded by two partners with backgrounds in big law firms and international projects. Fluent in English, Spanish, Russian, and Italian. Specializes in immigration and residency (work permits, Digital Nomad visa, Non-Lucrative visa, Golden Visa), property law, business law, and all areas of Spanish law. Premium personalized service with dedicated lawyers assigned to each case. Tailor-made legal solutions with personal, direct treatment. Trusted partner of Catalonia Trade & Investment, Barcelona Chamber of Commerce, British Chamber of Commerce in Spain, Tech Barcelona, and other official organizations. Open Monday-Friday 9:00-17:00. Video consultations available.',
  'C/ de València, 281, 2do, 08009',
  'Barcelona',
  'Barcelona',
  '+34 931 760 190',
  'info@klevvera.com',
  'https://www.klevvera.com/',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'KLEV&VERA Law Firm' AND city = 'Barcelona'
);
