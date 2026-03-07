-- Task 1290: Update Dr. Borras - Most Recommended Madrid Doctor
-- Avoid duplicate insertion by enriching the existing task 1280 listing

UPDATE directory_entries
SET
  description = 'Highly recommended English-speaking general practitioner in Madrid, frequently mentioned by expat communities as a trusted option for international patients. Provides routine check-ups, acute illness care, chronic disease management, health certificates, and preventive medicine with clear English communication.',
  category = 'Doctors',
  is_featured = true,
  updated_at = NOW()
WHERE address = 'Calle Padilla 20, Bajo derecha'
  AND city = 'Madrid'
  AND phone = '+34 915759834';
