-- Task 1403: Add Clínica Blasi - Dental - Barcelona
-- Data entry by subagent
-- English-speaking dental clinic in Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Blasi - English-speaking dental clinic in Barcelona
('Clínica Blasi', 'Dental', 'English-speaking dental clinic in Barcelona founded by Dr. José Ignacio Blasi in 1991 with over 30 years of experience providing professional and personalized dental care based on trust. Dentists trained in post-doctoral programs in the United States for 3+ years. Treats adults, teenagers and children with English-speaking staff to eliminate language barriers. Comprehensive dental services include dental implants and oral surgery, orthodontics, periodontics and gum treatment, aesthetics and dental prostheses, endodontics and root canals, and dentistry for children. Committed to quality, innovation and personalized treatment with state-of-the-art technology.', 'Carrer de Muntaner 341, 3º 3ª, 08021 Barcelona', 'Barcelona', 'Barcelona', '+34 934 146 404', 'info@clinicablasi.com', 'https://clinicablasi.com/en/', true, false, true, false, NOW(), NOW());
