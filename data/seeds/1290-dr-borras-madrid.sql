-- Task 1290: Update Dr. Borras - Most Recommended Madrid Doctor
-- Avoid duplicate insertion by enriching the existing task 1280 listing
-- Guard against silent UPDATE 0 when the base seed has not been applied.

DO $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE directory_entries
  SET
    description = 'Highly recommended English-speaking general practitioner in Madrid, frequently mentioned by expat communities as a trusted option for international patients. Provides routine check-ups, acute illness care, chronic disease management, health certificates, and preventive medicine with clear English communication.',
    category = 'Doctors',
    is_featured = true,
    updated_at = NOW()
  WHERE name = 'Dr Ruben Borras'
    AND city = 'Madrid';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    RAISE EXCEPTION 'Task 1290 update failed: base listing for Dr Ruben Borras not found. Apply task 1280 seed first.';
  END IF;
END
$$;
