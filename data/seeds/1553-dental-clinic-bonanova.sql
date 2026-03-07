-- Task 1553: Add Dental Clinic Bonanova - Dental - Barcelona
-- Data entry by Rupert
-- English-speaking dental clinic in Barcelona's Sarrià-Sant Gervasi neighborhood

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Dental Bonanova - English-Speaking Dental Clinic in Barcelona
('Clínica Dental Bonanova', 'Dentists', 'Dental clinic located in the Sarrià-Sant Gervasi neighborhood of Barcelona, serving patients with comprehensive dental care. Experienced team of dentists including Dr Jordi Harster, Dr Francesc Harster, and Dr Eduardo Plaz. Offers a range of dental services including general dentistry, periodontics, endodontics, orthodontics, and prosthodontics. Located on Passeig de la Bonanova in the upscale Les Tres Torres area, convenient for residents and international patients seeking quality dental care in Barcelona.', 'Passeig de la Bonanova 71, Sarrià-Sant Gervasi', 'Barcelona', 'Barcelona', '+34 932 127 588', NULL, NULL, true, false, true, false, NOW(), NOW());
