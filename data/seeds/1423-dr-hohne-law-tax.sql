-- Task 1423: Add Dr. Höhne Law & Tax - Legal/Tax - Barcelona
-- International law and tax firm serving English-speaking clients in Barcelona and Costa Brava

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
    'Dr. Höhne Law & Tax',
    'Legal',
    'International law and tax firm offering legal and tax solutions to companies, start-ups, freelancers, and individuals in Barcelona and Costa Brava. Founded by Dr. Hans-Hellmut Höhne in 1976, with over 25 years of experience advising international clients. As expats themselves, they understand the common issues and concerns that people living abroad face when needing legal services. Services include tax law, real estate law, inheritance law, family law, corporate law, contract law, start-up law, and criminal law. They provide company establishment support, investment advice, bookkeeping, payroll accounting, and contract drafting. 100% online service available for remote clients.',
    'Ronda de General Mitre, 179-181',
    'Barcelona',
    'Barcelona',
    '+34 934 533 866',
    'info@drhoehne.com',
    'https://drhoehne.com/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
