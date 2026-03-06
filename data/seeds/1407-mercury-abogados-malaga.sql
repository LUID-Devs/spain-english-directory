-- Task 1407: Add Mercury Abogados - Legal - Málaga
-- International multidisciplinary law firm in Marbella serving English-speaking clients

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
    created_at,
    updated_at
) VALUES (
    'Mercury Abogados',
    'Legal',
    'International multidisciplinary law firm in Marbella with extensive experience in real estate, commercial, company, tax, litigation, criminal, labour, family and inheritance law. Serving companies and individuals across Spain since 2009. First free consultation available. Home visits offered throughout Costa del Sol. Registered with the Málaga Bar Association.',
    'Avenida Arias Maldonado, 2 Edificio El Molino, 1ª-7, 29602 Marbella',
    'Marbella',
    'Málaga',
    '+34 951 05 28 11',
    'info@mercuryabogados.com',
    'https://www.mercuryabogados.com/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
