-- Task 1436: Exit Legal Advice - Legal/Tax - Barcelona
-- Source: Issue #1436
-- Website: https://exitlegal.net/

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
    'Exit Legal Advice',
    'Legal',
    'Law firm created by lawyers with more than 20 years of national and international legal practice. Committed to quality, honesty, professionalism and efficiency for all clients. Specialized services for expats in Spain including: Spanish tax residency and associated taxes, house rental, acquiring real estate, setting up a business, and other legal issues. Main services focus on legal and tax advice to individuals and entities, including correct fulfilment of tax obligations, adequate planning to minimize tax cost, double tax issues, assistance with tax audits/appeals, and tax residence issues. Also assists with legal aspects of starting new businesses, reviewing contracts, data protection, restructurings, real estate transactions and litigation.',
    'Vía Augusta 29, 6ª, 08006 Barcelona',
    'Barcelona',
    'Barcelona',
    '+34 935 95 04 96',
    'exitlegal@exitlegal.net',
    'https://exitlegal.net/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
