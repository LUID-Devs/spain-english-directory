-- Task 1558: Add Martin Hayes Abogados - Legal - Valencia
-- Data entry by subagent
-- Dual-qualified lawyer (Spain/Ireland) specializing in international private client work

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'Dual-qualified lawyer (Abogado in Spain and Solicitor in Ireland) providing English-speaking legal services in Valencia since 2004. Partner at SWAN Partners Tax & Legal in Valencia center. Specializes in property law, probate and inheritance matters, Spanish civil law, international private client work, and litigation before Spanish courts. Serves international clients worldwide with expertise in cross-border legal issues between Spain and English-speaking jurisdictions. Offers remote consultations via Zoom and Teams for clients unable to visit in person. Featured in Best Lawyers in Spain for Real Estate Law. Member of the Bar Association of Valencia (ICAV) and the Law Society of Ireland. Trusted advisor for expats and international families navigating Spanish legal systems.',
  address = 'SWAN Partners Tax & Legal, Valencia center',
  province = 'Valencia',
  phone = NULL,
  email = NULL,
  website = 'https://martinhayes.es',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Martin Hayes Abogados'
  AND city = 'Valencia';

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
  'Martin Hayes Abogados',
  'Legal',
  'Dual-qualified lawyer (Abogado in Spain and Solicitor in Ireland) providing English-speaking legal services in Valencia since 2004. Partner at SWAN Partners Tax & Legal in Valencia center. Specializes in property law, probate and inheritance matters, Spanish civil law, international private client work, and litigation before Spanish courts. Serves international clients worldwide with expertise in cross-border legal issues between Spain and English-speaking jurisdictions. Offers remote consultations via Zoom and Teams for clients unable to visit in person. Featured in Best Lawyers in Spain for Real Estate Law. Member of the Bar Association of Valencia (ICAV) and the Law Society of Ireland. Trusted advisor for expats and international families navigating Spanish legal systems.',
  'SWAN Partners Tax & Legal, Valencia center',
  'Valencia',
  'Valencia',
  NULL,
  NULL,
  'https://martinhayes.es',
  true,
  false,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Martin Hayes Abogados'
    AND city = 'Valencia'
);
