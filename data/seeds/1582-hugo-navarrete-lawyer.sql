-- Task 1582: Hugo Navarrete Lawyer - Property Law - Barcelona
-- Source: Issue #1582

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
    'Hugo Navarrete Lawyer',
    'Legal',
    'Property law specialist in Barcelona providing legal services for real estate transactions, property conveyancing, and related matters. Assists clients with property purchases, sales, rental agreements, and legal documentation. English-speaking legal services for expats and international clients navigating the Spanish property market. Expertise in property law matters including contract review, due diligence, and ensuring smooth real estate transactions in Barcelona and surrounding areas. Over 20 years of experience helping international clients with property and employment law matters.',
    'Calle Princesa 34, 2º1',
    'Barcelona',
    'Barcelona',
    '+34 661 886 587',
    'hugo.navarrete@gmail.com',
    'https://www.hugolawyer.com',
    true,
    false,
    false,
    false,
    NOW(),
    NOW()
);
