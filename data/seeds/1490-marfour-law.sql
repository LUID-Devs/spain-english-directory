-- Task 1490: Add Marfour Law - Legal - Barcelona/Madrid
-- Data entry for English-speaking legal services for expats

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'International law firm founded by Maryem Essadik specializing in Spanish Immigration, Real Estate, Corporate and Tax Law for expats. Multilingual team speaks English, Spanish, French, Arabic, Turkish, and Russian. Services include visa applications (Golden Visa, Non-Lucrative, Digital Nomad, Entrepreneur, Student, Work visas), property conveyancing, company formation, tax planning, Spanish citizenship applications, family reunification, and legal representation for appeals. Registered with the Barcelona Bar Association (ICAB 45.125). Also serves clients in Madrid area. Personalized attention with video consultations available.',
  address = 'C/ de Bailèn, 36, 4º 2ª Izda, 08010',
  province = 'Barcelona',
  phone = '+34 698 917 840',
  email = 'info@marfourlaw.com',
  website = 'https://marfourlaw.com',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Marfour International Law Firm' AND city = 'Barcelona';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'Marfour International Law Firm',
  'Legal',
  'International law firm founded by Maryem Essadik specializing in Spanish Immigration, Real Estate, Corporate and Tax Law for expats. Multilingual team speaks English, Spanish, French, Arabic, Turkish, and Russian. Services include visa applications (Golden Visa, Non-Lucrative, Digital Nomad, Entrepreneur, Student, Work visas), property conveyancing, company formation, tax planning, Spanish citizenship applications, family reunification, and legal representation for appeals. Registered with the Barcelona Bar Association (ICAB 45.125). Also serves clients in Madrid area. Personalized attention with video consultations available.',
  'C/ de Bailèn, 36, 4º 2ª Izda, 08010',
  'Barcelona',
  'Barcelona',
  '+34 698 917 840',
  'info@marfourlaw.com',
  'https://marfourlaw.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'Marfour International Law Firm' AND city = 'Barcelona'
);

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'International law firm founded by Maryem Essadik specializing in Spanish Immigration, Real Estate, Corporate and Tax Law for expats. Multilingual team speaks English, Spanish, French, Arabic, Turkish, and Russian. Services include visa applications (Golden Visa, Non-Lucrative, Digital Nomad, Entrepreneur, Student, Work visas), property conveyancing, company formation, tax planning, Spanish citizenship applications, family reunification, and legal representation for appeals. Registered with the Barcelona Bar Association (ICAB 45.125). Supports clients in the Madrid area through remote and scheduled consultations.',
  address = 'Madrid',
  province = 'Madrid',
  phone = '+34 698 917 840',
  email = 'info@marfourlaw.com',
  website = 'https://marfourlaw.com',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Marfour International Law Firm' AND city = 'Madrid';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'Marfour International Law Firm',
  'Legal',
  'International law firm founded by Maryem Essadik specializing in Spanish Immigration, Real Estate, Corporate and Tax Law for expats. Multilingual team speaks English, Spanish, French, Arabic, Turkish, and Russian. Services include visa applications (Golden Visa, Non-Lucrative, Digital Nomad, Entrepreneur, Student, Work visas), property conveyancing, company formation, tax planning, Spanish citizenship applications, family reunification, and legal representation for appeals. Registered with the Barcelona Bar Association (ICAB 45.125). Supports clients in the Madrid area through remote and scheduled consultations.',
  'Madrid',
  'Madrid',
  'Madrid',
  '+34 698 917 840',
  'info@marfourlaw.com',
  'https://marfourlaw.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'Marfour International Law Firm' AND city = 'Madrid'
);
