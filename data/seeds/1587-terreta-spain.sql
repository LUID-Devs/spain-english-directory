-- Task 1587: Add Terreta Spain - Real Estate - Valencia
-- Enriches the existing Valencia entry from 1491 with more detailed data
-- Uses UPDATE to avoid duplicate entries since 1491 was already executed
-- Includes guard to ensure the update actually affects a row

DO $$
BEGIN
    UPDATE directory_entries SET
        description = 'English-speaking real estate agency and construction company specializing in turnkey rental investment properties in Valencia and Madrid. Founded in 2022 by Antoine Évêque and Geoffroy Reiser, former executives at Masteos. Offers comprehensive services including property purchase, sale, renovation, interior design, and rental management. Multilingual team speaking English, French, German, and Spanish. Has completed over 100 apartment renovations and helped 150+ clients. Director of Renovations Gaetano Grana brings 25 years of construction experience including major projects in Madrid and Valencia. Specializes in helping international buyers and expats navigate the Spanish property market with personalized, transparent service.',
        address = 'Multiple locations in Valencia',
        updated_at = NOW()
    WHERE name = 'Terreta Spain' AND city = 'Valencia';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No rows updated - prerequisite entry for Terreta Spain (Valencia) from task 1491 not found';
    END IF;
END $$;
