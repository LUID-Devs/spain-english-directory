-- Task 1626: Add Spain Lawyer (Spainlawyer.com) - Legal - Madrid
-- Source: Issue #1626
-- Website: https://www.spainlawyer.com/

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
    'Spain Lawyer',
    'Legal',
    'Leading English-speaking law firm headquartered in Madrid with over 15 years of experience providing comprehensive legal services to expats and international clients throughout Spain. Also known as iAbogado, the firm offers expert legal assistance in civil, criminal, family, labour and administrative matters. Practice areas include conveyancing assistance (home purchase/sale, lease contracts, mortgage consultations), criminal law and legal defence in driving cases, Spanish NIE number applications, probate and executor assistance, Spanish company formation, uncontested divorce proceedings, and debt collection services. With a network of local offices across Spain including Marbella, Barcelona, Valencia, Balearic Islands and Canary Islands, they provide personalized legal support tailored to English-speaking clients with clear communication throughout the legal process.',
    'Paseo de la Castellana, 179 Ascensor C, 1st Floor',
    'Madrid',
    'Madrid',
    '+34 91 748 93 57',
    'admin@iabogado.com',
    'https://www.spainlawyer.com/',
    true,
    false,
    false,
    false,
    NOW(),
    NOW()
);
