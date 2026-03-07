-- Task 1552: Add Deutsche ZK Dental Clinic - Dental - Barcelona
-- Source: Web research - deutsche-zk.com
-- Category: Dental / Dentists

-- Delete existing entry to ensure updates propagate
DELETE FROM directory_entries WHERE name LIKE 'Deutsche ZK%' AND city = 'Barcelona';

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
    'Deutsche ZK Clínica Dental',
    'Dental',
    'German dental clinic in the heart of Barcelona city center with an all English-speaking staff. Founded in 2007 as a multi-lingual center focused on providing healthcare to English, German, French, and Italian-speaking communities as well as locals. Led by Dr. Christian Eickhoff and Dr. Alexander Müller, the clinic specializes in implantology, cosmetic dentistry, orthodontics, and general dentistry. Services include dental implants, metal-free treatments, teeth whitening, endodontics (root canal treatment), oral surgery, and aesthetic dentistry. The clinic is known for offering primary dental healthcare at affordable prices compared to other European countries. Conveniently located in the Eixample district at the corner of Consell de Cent and Muntaner. The team provides personalized care with a focus on international patients and expats living in Barcelona.',
    'Carrer del Consell de Cent, 249, bajos (esquina Muntaner), 08011 Barcelona',
    'Barcelona',
    'Barcelona',
    '+34 933 239 629',
    NULL,
    'https://www.deutsche-zk.com/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
