-- Task 1443: Add Tax&Law Consulting - Tax/Legal - Málaga
-- Comprehensive tax advisory and legal services in Málaga for English-speaking clients

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
    'Tax&Law Consulting',
    'Tax/Accounting',
    'Comprehensive tax advisory and legal firm in the historic center of Málaga, offering fully comprehensive tax services for companies and self-employed individuals. Their team has extensive experience in prestigious firms and provides customized solutions for each client. Services include tax form submission (Personal Income Tax, VAT, Corporate Tax, Inheritance and Donations Tax), comprehensive accounting services, vacation rental property tax advice, appeals and claims before tax authorities, tax planning for inheritances, and tax authority inspection assistance. Specialized tax advice in English for foreign and non-resident clients living in Málaga or owning businesses and real estate in the province.',
    'C/ Salvago 3, 1º Izquierda A',
    'Málaga',
    'Málaga',
    '+34 951 103 137',
    'info@taxlawconsulting.es',
    'https://www.taxlawconsulting.es/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
