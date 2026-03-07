-- Task 1552: Add Deutsche ZK Dental Clinic - Dental - Barcelona
-- Source: Manual research - deutsche-zk.com
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
    'Deutsche ZK Dental Clinic',
    'Dentists',
    'German dental clinic in the heart of Barcelona with an all English-speaking staff. Run by Dr Christian Eickhoff and Dr Alexander Müller, offering comprehensive dental care for the international community. Multilingual team speaks English, Spanish, and German. Specializes in implants, metal-free treatments, teeth whitening, endodontics, and general dentistry. Experienced in treating expats and international patients with modern facilities and a patient-centered approach. Centrally located in Eixample district.',
    'Carrer Consell de Cent 249, bajos, 08011 Barcelona',
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
