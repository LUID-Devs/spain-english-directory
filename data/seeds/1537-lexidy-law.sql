-- Task 1537: Refresh Lexidy Law Firm listings - Barcelona/Madrid
-- Updates canonical Lexidy rows without creating duplicates.

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'English-speaking international law firm specializing in immigration, property, and business law for expats in Spain. Services include visa applications (Digital Nomad, Non-Lucrative, Golden Visa), property conveyancing, company formation, contract review, and tax planning.',
  address = 'Avinguda Diagonal, 442, 1º 1ª, 08037',
  province = 'Barcelona',
  phone = '+34 938 07 40 56',
  email = 'info@lexidy.com',
  website = 'https://www.lexidy.com',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Lexidy Law Firm'
  AND city = 'Barcelona';

UPDATE directory_entries
SET
  category = 'Legal',
  description = 'English-speaking international law firm specializing in immigration, property, and business law for expats in Spain. Services include visa applications (Digital Nomad, Non-Lucrative, Golden Visa), property conveyancing, company formation, contract review, and tax planning.',
  address = 'Calle Villalar 7, Bajo Izquierda, 28001',
  province = 'Madrid',
  phone = '+34 915 367 806',
  email = 'info@lexidy.com',
  website = 'https://www.lexidy.com',
  speaks_english = true,
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Lexidy Law Firm'
  AND city = 'Madrid';
