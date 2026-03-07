-- Task 175: Backfix legacy duplicate overlaps in directory_entries
-- Keeps one row per (name, city) for known duplicate patterns introduced by historical seed overlaps.

-- HTJ.tax (Barcelona): retain the oldest row, remove additional duplicates.
WITH ranked_htj AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY name, city ORDER BY id ASC) AS rn
  FROM directory_entries
  WHERE name = 'HTJ.tax'
    AND city = 'Barcelona'
)
DELETE FROM directory_entries d
USING ranked_htj r
WHERE d.id = r.id
  AND r.rn > 1;

-- Blevins Franks (Girona): retain the oldest row, remove additional duplicates.
WITH ranked_blevins AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY name, city ORDER BY id ASC) AS rn
  FROM directory_entries
  WHERE name = 'Blevins Franks'
    AND city = 'Girona'
)
DELETE FROM directory_entries d
USING ranked_blevins r
WHERE d.id = r.id
  AND r.rn > 1;
