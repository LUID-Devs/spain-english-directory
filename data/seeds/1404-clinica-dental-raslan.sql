-- Task 1404: Add Clínica Dental Raslan - Dental - Barcelona
-- English-speaking dental clinic with two Barcelona locations

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Dental Raslan - Sarrià-Sant Gervasi location (main clinic)
('Clínica Dental Raslan', 'Dental', 'English-speaking dental clinic in Barcelona with two convenient locations. Main clinic in Sarrià-Sant Gervasi (C/Ganduxer 59 Bis) and emergency dental services in Eixample (Pl. Tetuán, 16). Specialists in dental implants, orthodontics, dental aesthetics, endodontics, and periodontics. 24-hour emergency dentist service available year-round. Popular with international patients and expats. English-speaking staff for comfortable communication throughout all dental procedures.', 'C/ Ganduxer 59 Bis, 08022 Barcelona', 'Barcelona', 'Barcelona', '+34 937 656 788', 'info@clinicaraslan.com', 'https://clinicaraslan.com/en/', true, false, true, false, NOW(), NOW()),

-- Clínica Dental Raslan - Eixample location (24hr emergency services)
('Clínica Dental Raslan', 'Dental', 'English-speaking dental clinic in Barcelona with two convenient locations. Main clinic in Sarrià-Sant Gervasi (C/Ganduxer 59 Bis) and emergency dental services in Eixample (Pl. Tetuán, 16). Specialists in dental implants, orthodontics, dental aesthetics, endodontics, and periodontics. 24-hour emergency dentist service available year-round. Popular with international patients and expats. English-speaking staff for comfortable communication throughout all dental procedures.', 'Pl. Tetuán, 16, 08010 Barcelona', 'Barcelona', 'Barcelona', '+34 669 154 020', 'info@clinicaraslan.com', 'https://clinicaraslan.com/en/', true, false, true, false, NOW(), NOW());
