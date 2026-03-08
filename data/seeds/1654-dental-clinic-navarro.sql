-- Task 1654: Add/Update Dental Clinic Navarro - Dental - Madrid
-- Data entry by subagent
-- English-speaking dental clinic in Madrid specializing in implants and digital dentistry
-- Idempotent seed for repeatable environments.

UPDATE directory_entries
SET
  category = 'Dentists',
  description = 'English-speaking dental clinic in Madrid city center founded by dentists from the first promotion of Dentistry at U.C.M. University. Specializes in dental implants, orthodontics, periodontics, endodontics, and dental aesthetics. Offers conscious sedation treatments for anxious patients and digital smile design using the latest technology. The clinic is equipped with cutting-edge dental technology and staffed by highly reputed specialists with postgraduate training at prestigious international universities. Personalized treatment plans with detailed studies and customized budgets. Belongs to the Círculo de Odontólogos y Estomatólogos (COE). Two locations: Madrid Capital center (near La Latina, Puerta del Sol, Opera) and Becerril de la Sierra. Offers 5% discount on dental aesthetic treatments when requested through website, free dental study, and comfortable financing options.',
  address = 'C/ Duque de Alba 12, 1.º Derecha, 28012 Madrid',
  province = 'Madrid',
  phone = '+34 913 642 872',
  email = 'info@dentalnavarro.com',
  website = 'https://www.dentalnavarro.com/en/',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'Dental Clinic Navarro'
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
  'Dental Clinic Navarro',
  'Dentists',
  'English-speaking dental clinic in Madrid city center founded by dentists from the first promotion of Dentistry at U.C.M. University. Specializes in dental implants, orthodontics, periodontics, endodontics, and dental aesthetics. Offers conscious sedation treatments for anxious patients and digital smile design using the latest technology. The clinic is equipped with cutting-edge dental technology and staffed by highly reputed specialists with postgraduate training at prestigious international universities. Personalized treatment plans with detailed studies and customized budgets. Belongs to the Círculo de Odontólogos y Estomatólogos (COE). Two locations: Madrid Capital center (near La Latina, Puerta del Sol, Opera) and Becerril de la Sierra. Offers 5% discount on dental aesthetic treatments when requested through website, free dental study, and comfortable financing options.',
  'C/ Duque de Alba 12, 1.º Derecha, 28012 Madrid',
  'Madrid',
  'Madrid',
  '+34 913 642 872',
  'info@dentalnavarro.com',
  'https://www.dentalnavarro.com/en/',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Dental Clinic Navarro'
    AND city = 'Madrid'
);
