-- Terreta Spain - Real Estate Agency
-- Madrid & Valencia - English-speaking services for expats
-- Issue #1491

-- Insert provider
INSERT INTO providers (
    id,
    name,
    slug,
    description,
    short_description,
    website,
    email,
    phone,
    address,
    city,
    region,
    postal_code,
    country,
    latitude,
    longitude,
    is_verified,
    is_featured,
    is_english_speaking,
    languages_spoken,
    services,
    specialties,
    business_type,
    founded_year,
    logo_url,
    cover_image_url,
    metadata,
    status,
    created_at,
    updated_at
) VALUES (
    'terreta-spain-real-estate',
    'Terreta Spain',
    'terreta-spain-real-estate',
    'Terreta Spain is both a real estate agency and a renovation company, working together to help expats with their property projects in Spain. Since 2022, they have helped over 150 customers buy, sell and renovate properties across Madrid and Valencia. Their team provides personalized service in English, French or Spanish, guiding clients through every step of the process from property search to renovation completion. With over 100 apartment renovations completed, they offer a unique turnkey solution for those looking to purchase and transform their dream home in Spain.',
    'English-speaking real estate agency & renovation company serving Madrid and Valencia. Full turnkey service from property search to renovation.',
    'https://terretaspain.com',
    'contact@terreta-spain.com',
    NULL,
    'Calle Almirante Cadarso 26, 46005 Valencia',
    'Valencia',
    'Valencia',
    '46005',
    'ES',
    39.4699,
    -0.3763,
    true,
    false,
    true,
    ARRAY['English', 'French', 'Spanish'],
    ARRAY['Property Sales', 'Property Rentals', 'Property Renovation', 'Interior Design', 'Rental Management', 'Turnkey Investment', 'Property Search', 'Legal Assistance'],
    ARRAY['Expat Buyers', 'Property Investment', 'Renovation Projects', 'Turnkey Properties', 'Rental Investment', 'Second Homes'],
    'real_estate_agency',
    2022,
    NULL,
    NULL,
    '{"cif": "B56812571", "company_name": "Terreta International Realty S.L.", "legal_form": "Sociedad Limitada (S.L.)", "additional_offices": ["Calle Buenavista, Madrid", "Calle Cura Planelles, Valencia", "Calle Alfauir, Gandia", "Calle Juan Mercader, Valencia"]}',
    'active',
    NOW(),
    NOW()
);

-- Insert provider locations (for Madrid office)
INSERT INTO provider_locations (
    provider_id,
    location_type,
    address,
    city,
    region,
    postal_code,
    country,
    latitude,
    longitude,
    is_primary,
    created_at
) VALUES (
    'terreta-spain-real-estate',
    'office',
    'Calle Buenavista',
    'Madrid',
    'Madrid',
    NULL,
    'ES',
    40.4168,
    -3.7038,
    false,
    NOW()
);

-- Insert category mapping (Real Estate)
INSERT INTO provider_categories (
    provider_id,
    category_id,
    created_at
) VALUES (
    'terreta-spain-real-estate',
    'real-estate',
    NOW()
);

-- Insert service areas
INSERT INTO provider_service_areas (
    provider_id,
    city,
    region,
    country,
    created_at
) VALUES 
    ('terreta-spain-real-estate', 'Valencia', 'Valencia', 'ES', NOW()),
    ('terreta-spain-real-estate', 'Madrid', 'Madrid', 'ES', NOW()),
    ('terreta-spain-real-estate', 'Gandia', 'Valencia', 'ES', NOW());

-- Insert tags
INSERT INTO provider_tags (
    provider_id,
    tag,
    created_at
) VALUES 
    ('terreta-spain-real-estate', 'english-speaking', NOW()),
    ('terreta-spain-real-estate', 'real-estate', NOW()),
    ('terreta-spain-real-estate', 'renovation', NOW()),
    ('terreta-spain-real-estate', 'madrid', NOW()),
    ('terreta-spain-real-estate', 'valencia', NOW()),
    ('terreta-spain-real-estate', 'expat-friendly', NOW()),
    ('terreta-spain-real-estate', 'turnkey', NOW()),
    ('terreta-spain-real-estate', 'investment', NOW()),
    ('terreta-spain-real-estate', 'property-management', NOW()),
    ('terreta-spain-real-estate', 'interior-design', NOW());
