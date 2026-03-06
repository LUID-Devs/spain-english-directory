-- Task 1461: Add El Cedro Barcelona - Dental - Barcelona
-- Source: Web research - elcedrobarcelona.com
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
    'El Cedro Barcelona',
    'Dental',
    'English-speaking dental clinic in Barcelona specializing in implantology and dental surgery. Founded in 2000 by Dr. Olivier Bournay and led by Dr. Leticia Rodriguez, El Cedro offers high-quality dental treatment at affordable prices. The clinic is equipped with the latest technology and high-end CE-marked equipment. Services include dental implants (All-On-4, immediate loading, bone grafting), oral surgery, prosthetics (crowns, bridges), and aesthetic dentistry. The team uses premium European implant brands including Nobel Biocare, GC AADVA, and Global D. They have their own in-house prosthesis laboratory to guarantee quality. For anxious patients or complex procedures, treatments can be performed under conscious sedation administered by anaesthesiologists. The clinic has welcomed overseas patients since 2013 and prides itself on providing personalized care with close post-surgical follow-up. Located in the L''Eixample district near the Sagrada Familia.',
    'Carrer de Girona, 108, 08009 Barcelona',
    'Barcelona',
    'Barcelona',
    NULL,
    NULL,
    'https://www.elcedrobarcelona.com/en/',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
