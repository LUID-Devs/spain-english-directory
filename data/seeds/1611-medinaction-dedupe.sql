-- Task 1611: MedinAction cleanup
-- Removes duplicate MedinAction entries per city while keeping the most recently updated row.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY name, city
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS rn
  FROM directory_entries
  WHERE name = 'MedinAction'
)
DELETE FROM directory_entries d
USING ranked r
WHERE d.id = r.id
  AND r.rn > 1;
