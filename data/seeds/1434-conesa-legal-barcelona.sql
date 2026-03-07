-- Task 1434: Update Conesa Legal - Legal - Barcelona
-- Avoid duplicate insertion: enrich and verify the existing Conesa Legal row seeded in task 1363

UPDATE directory_entries
SET
  description = 'Leading Barcelona law firm with over 50 years of experience specializing in employment law, labour compliance, and social security. Advises SMEs on Spanish employment laws, payroll, accounting and social security. Helps individuals with unfair dismissal and workplace harassment cases. Also provides corporate, tax, immigration, family, and civil law services. Multilingual team speaks English, Spanish, Catalan and French. Members of Aliant Law international network.',
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Conesa Legal'
  AND city = 'Barcelona'
  AND address = 'Avda. Diagonal 467, 6-1, 08036';
