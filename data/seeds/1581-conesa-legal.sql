-- Task 1581: Add Conesa Legal - Legal - Barcelona
-- Data entry for Spain English Directory
-- English-speaking law firm in Barcelona serving the expat community
-- Note: Conesa Legal was previously added in task 1363 and updated in task 1434
-- This update enhances the existing entry with additional information

UPDATE directory_entries
SET
  description = 'Established law firm in Barcelona with over 50 years of experience providing comprehensive legal services to English-speaking expats and international clients. Specializes in employment law, labour disputes, dismissals, permanent disability claims, and social security matters. Also offers expertise in immigration law, tax advisory, corporate law, civil law, family law (divorce, inheritance, wills), and mediation services. Multilingual team provides services in English, Spanish, Catalan, French, and Italian. Member of Aliant Law international network, enabling cross-border legal assistance across Europe, America, Africa, and Asia. Offers online and telematic services for remote clients. Committed to combining empathy with legal rigor to anticipate risks and maximize opportunities for both businesses and individuals.',
  is_verified = true,
  updated_at = NOW()
WHERE name = 'Conesa Legal'
  AND city = 'Barcelona'
  AND address = 'Avda. Diagonal 467, 6-1, 08036';
