-- Task 1593: Add Clínica Cloe - Dental - Madrid
-- Source: Manual research - clinicacloe.com
-- Category: Dental / Dentists

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
    'Clínica Cloe',
    'Dental',
    'Private dental clinic in Madrid located near Campo de las Naciones and IFEMA. The only Digital Smile Design Certified Clinic in Madrid, part of an exclusive network delivering tailor-made smiles. Founded over a decade ago by Medical Directors Dr. Víctor Begara Medina and Dra Mya Choufani. Dr. Begara is a leading dental implant specialist with postgraduate training at New York University College of Dentistry. Dra Choufani holds a Doctorate of Dental Surgery (DDS) from NYU College of Dentistry, a Bachelor of Arts from Boston College, and completed her General Practice Residency at Mount Sinai Hospital in New York. Multilingual team speaks English, Spanish, French, German, and Ukrainian. Comprehensive services include dental implants, cosmetic dentistry, paediatric dentistry, general dentistry, orthodontics with Invisalign Diamond specialist, periodontics, and endodontics. Highly experienced with international and expat patients.',
    'Avenida de los Prunos 5-7, 28042 Madrid',
    'Madrid',
    'Madrid',
    '+34 91 371 7919',
    'clinica@clinicacloe.com',
    'https://www.clinicacloe.com/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
