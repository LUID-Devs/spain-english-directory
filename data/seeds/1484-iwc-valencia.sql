-- Task 1484: Add IWC Valencia - Medical Clinic - Valencia
-- Data entry by Plankton
-- Source: iwc-valencia.com
-- Made idempotent: refresh existing row, insert only when missing.

UPDATE directory_entries
SET
  category = 'Doctors',
  description = 'Expat-friendly medical clinic in Valencia offering comprehensive healthcare services with English-speaking staff and doctors. Provides multiple specialties including Dermatology, Cardiology, Psychiatry, Ear-Nose-Throat (ENT), Gynecology (OB-GYN), Trauma & Orthopedics, Pulmonology, and General Medicine. All doctors and staff speak fluent English, with additional language support in French, German, and Italian. International Department assists expat and international patients with healthcare navigation, insurance coordination, and medical documentation. Located in the Extramurs district with convenient access for Valencia residents.',
  address = 'El Cremaet, Pl. del Pintor Segrelles, Extramurs, 46007 Valencia',
  province = 'Valencia',
  phone = NULL,
  email = NULL,
  website = 'https://www.iwc-valencia.com',
  speaks_english = true,
  is_featured = false,
  is_verified = true,
  is_claimed = false,
  updated_at = NOW()
WHERE name = 'IWC Valencia Medical' AND city = 'Valencia';

INSERT INTO directory_entries (
  name, category, description, address, city, province, phone, email, website,
  speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at
)
SELECT
  'IWC Valencia Medical',
  'Doctors',
  'Expat-friendly medical clinic in Valencia offering comprehensive healthcare services with English-speaking staff and doctors. Provides multiple specialties including Dermatology, Cardiology, Psychiatry, Ear-Nose-Throat (ENT), Gynecology (OB-GYN), Trauma & Orthopedics, Pulmonology, and General Medicine. All doctors and staff speak fluent English, with additional language support in French, German, and Italian. International Department assists expat and international patients with healthcare navigation, insurance coordination, and medical documentation. Located in the Extramurs district with convenient access for Valencia residents.',
  'El Cremaet, Pl. del Pintor Segrelles, Extramurs, 46007 Valencia',
  'Valencia',
  'Valencia',
  NULL,
  NULL,
  'https://www.iwc-valencia.com',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM directory_entries WHERE name = 'IWC Valencia Medical' AND city = 'Valencia'
);
