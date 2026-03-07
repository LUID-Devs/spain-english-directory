-- Task 1290: Dr Borras Reddit Insight - Enhanced Provider Data
-- Source: Reddit research, Doctoralia, Yelp, SLU-Madrid, NYU Madrid
-- Research Date: March 2025

-- Dr Ruben Borras - Enhanced Entry with Reddit Research Data
INSERT INTO directory_entries (
    name, 
    category, 
    description, 
    address, 
    city, 
    province, 
    phone, 
    email, 
    website, 
    speaks_english, 
    is_featured, 
    is_verified, 
    is_claimed,
    hours,
    languages,
    accepts_insurance,
    house_calls,
    referral_sources,
    created_at, 
    updated_at
) VALUES (
    'Dr Rubén Borrás',
    'Healthcare',
    'Highly recommended English-speaking general practitioner in Madrid. US-trained physician with 20+ years experience serving the expat community. Frequently recommended on Reddit by BEDA participants and English teachers. Specializes in general practice, family medicine, and expat healthcare navigation. Known for flawless English, familiarity with US pharmaceuticals, and house call availability. Official physician for SLU-Madrid and NYU Madrid students.',
    'Calle Padilla 20, Bajo Derecha, 28006 Madrid',
    'Madrid',
    'Madrid',
    '+34 915 759 834',
    'dr.rvborras@gmail.com',
    NULL,
    true,
    true,
    true,
    false,
    'Monday-Friday: 12:00-18:30',
    'English, Spanish',
    'Sanitas, Major Spanish Insurers',
    true,
    'r/Madrid, r/SpainAuxiliares, SLU-Madrid, NYU Madrid Hub, American Club of Madrid',
    NOW(),
    NOW()
);

-- Additional Location Entry (Secondary Office)
INSERT INTO directory_entries (
    name, 
    category, 
    description, 
    address, 
    city, 
    province, 
    phone, 
    email, 
    website, 
    speaks_english, 
    is_featured, 
    is_verified, 
    is_claimed,
    hours,
    languages,
    accepts_insurance,
    referral_sources,
    created_at, 
    updated_at
) VALUES (
    'Dr Rubén Borrás (Núñez de Balboa Office)',
    'Healthcare',
    'Secondary office location for Dr. Rubén Borrás. Same high-quality English-speaking general practice services. Convenient for Salamanca district residents.',
    'Calle Núñez de Balboa 107, Office 005, 28006 Madrid',
    'Madrid',
    'Madrid',
    '+34 66 684 79 88',
    'dr.rvborras@gmail.com',
    NULL,
    true,
    false,
    true,
    false,
    'By appointment',
    'English, Spanish',
    'Sanitas, Major Spanish Insurers',
    false,
    'SLU-Madrid Official Physician',
    NOW(),
    NOW()
);

-- Tags for categorization
INSERT INTO entry_tags (entry_id, tag) VALUES
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'general-practice'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'family-medicine'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'expat-friendly'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'beda-recommended'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'english-speaking'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'house-calls'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'student-healthcare'),
    ((SELECT id FROM directory_entries WHERE name = 'Dr Rubén Borrás'), 'us-trained');
