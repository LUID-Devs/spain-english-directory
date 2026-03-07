-- Task 1654: Add Dental Clinic Navarro - Dental - Madrid
-- Data entry by subagent
-- English-speaking dental clinic in Madrid for expats and international patients

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
    'Dental Clinic Navarro',
    'Dentists',
    'Family-owned dental clinic in central Madrid with over 30 years of experience serving the international community. English-speaking dentists specialized in dental implants, orthodontics, periodontics, endodontics, and dental aesthetics. Offers digital smile design using the latest technology for personalized treatment planning. Located in the La Latina neighborhood, easily accessible from Puerta del Sol, Plaza Mayor, and Gran Vía. Founded by dentists who met at Universidad Complutense de Madrid (U.C.M) with postgraduate training at prestigious international universities. Member of the Círculo de Odontólogos y Estomatólogos (COE). Provides personalized attention, comfortable financing options, and a 5% discount on aesthetic treatments when booked through the website. Free dental study available for new patients.',
    'C/ Duque de Alba 12, 1.º Derecha, 28012 Madrid',
    'Madrid',
    'Madrid',
    '+34 91 364 28 72',
    'info@dentalnavarro.com',
    'https://www.dentalnavarro.com/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
