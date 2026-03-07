-- Task 1444/1555: Add Spence Clarke - Tax/Legal/Audit - Spain
-- Data entry for Spain English Directory
-- Nationwide service provider based in Marbella, Costa del Sol

UPDATE directory_entries
SET
  category = 'Tax Advisors',
  description = 'Established in 1985 in Marbella, Spence Clarke is one of the few tax and accountancy practices in southern Spain authorised by the Institute of Chartered Accountants in England and Wales. The senior partner is also a member of equivalent Spanish tax and accountancy institutions. The practice specialises in Spanish tax, legal, audit and accountancy services, primarily for foreigners with interests in Spain. Tax services include consultancy for resident and non-resident individuals, tax-efficient asset structuring for high net worth individuals, wealth tax planning, Spanish inheritance tax, and cross-border tax issues. Legal services include Spanish wills and probate, property purchase and sale, due diligence reporting, property ownership structuring, and company law services. Audit and accountancy services include statutory compliance, company tax, payroll management, and live accounting systems. Cross-border expertise helps clients adapt to the Spanish system with minimum disruption. Based in Marbella with nationwide service coverage across Spain including Costa del Sol, Costa Blanca, Balearic and Canary Islands.',
  address = 'Edificio los Pinos L1, Calle Jacinto Benavente 32',
  province = 'Málaga',
  phone = '+34 952 82 29 43',
  email = 'info@spenceclarke.com',
  website = 'https://www.spenceclarke.com',
  speaks_english = true,
  is_featured = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Spence Clarke'
  AND city = 'Marbella';

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
  'Spence Clarke',
  'Tax Advisors',
  'Established in 1985 in Marbella, Spence Clarke is one of the few tax and accountancy practices in southern Spain authorised by the Institute of Chartered Accountants in England and Wales. The senior partner is also a member of equivalent Spanish tax and accountancy institutions. The practice specialises in Spanish tax, legal, audit and accountancy services, primarily for foreigners with interests in Spain. Tax services include consultancy for resident and non-resident individuals, tax-efficient asset structuring for high net worth individuals, wealth tax planning, Spanish inheritance tax, and cross-border tax issues. Legal services include Spanish wills and probate, property purchase and sale, due diligence reporting, property ownership structuring, and company law services. Audit and accountancy services include statutory compliance, company tax, payroll management, and live accounting systems. Cross-border expertise helps clients adapt to the Spanish system with minimum disruption. Based in Marbella with nationwide service coverage across Spain including Costa del Sol, Costa Blanca, Balearic and Canary Islands.',
  'Edificio los Pinos L1, Calle Jacinto Benavente 32',
  'Marbella',
  'Málaga',
  '+34 952 82 29 43',
  'info@spenceclarke.com',
  'https://www.spenceclarke.com',
  true,
  true,
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM directory_entries
  WHERE name = 'Spence Clarke'
    AND city = 'Marbella'
);
