-- Task 1487: Refresh MedinAction verification/feature flags
-- Apply conservative status without duplicating existing 1238 inserts.

UPDATE directory_entries
SET
  is_featured = false,
  is_verified = false,
  updated_at = NOW()
WHERE name = 'MedinAction'
  AND city IN ('Madrid', 'Barcelona', 'Malaga', 'Málaga', 'Marbella', 'Ibiza');
