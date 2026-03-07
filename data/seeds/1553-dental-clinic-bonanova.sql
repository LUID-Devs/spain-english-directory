-- Task 1553: Add Dental Clinic Bonanova - Dental - Barcelona
-- Data entry for Spain English Directory
-- Source: Barcelona City Council guide, Doctoralia, WhatClinic
-- Category: Dentists / Dental

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
    'Clinica Dental Bonanova',
    'Dentists',
    'Established dental clinic in Barcelona''s Sarrià-Sant Gervasi district offering comprehensive dental care services. Located on Passeig de la Bonanova in the les Tres Torres neighborhood, the clinic provides general dentistry, dental aesthetics, orthodontics, implantology, endodontics, periodontics, and prosthodontics. The experienced team includes Dr. Jordi Harster, Dr. Francesc Harster, and Dr. Eduardo Plaz. The clinic offers modern treatments including teeth whitening, dental implants, CAD/CAM dental restorations, bone grafting, sinus lifts, and sedation for dental treatments. Serving patients in the Barcelona area with professional dental care for the whole family.',
    'Pg Bonanova, 71, entresuelo',
    'Barcelona',
    'Barcelona',
    '+34 932 127 588',
    NULL,
    NULL,
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
