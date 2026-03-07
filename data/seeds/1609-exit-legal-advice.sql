-- Task 1609: Enrich Exit Legal Advice with address - Legal/Tax - Barcelona
-- Data entry for Spain English Directory
-- Updates existing record from Task 1436 with address information

UPDATE directory_entries 
SET address = 'Vía Augusta 29, 08006',
    updated_at = NOW()
WHERE name = 'Exit Legal Advice' 
  AND phone = '+34 935 95 04 96';
