-- Task 1403: Add Clínica Blasi - Dental - Barcelona
-- Data entry by subagent
-- English-speaking dental clinic in Barcelona's Sarrià-Sant Gervasi neighborhood

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Blasi - English-speaking dental clinic in Barcelona
('Clínica Blasi', 'Dental', 'English-speaking dental clinic in Barcelona''s Sarrià-Sant Gervasi neighborhood. Established in 1990 by Dr. José Ignacio Blasi, the clinic has over 25 years of experience serving the community. All doctors have completed 3-4 years of postgraduate training at the best dental universities in the United States and Europe. Offers comprehensive dental services including dental implants, oral surgery, orthodontics (braces and aligners), dental prostheses (crowns, bridges, dentures), periodontics (gum disease treatment), endodontics (root canals), and dental whitening (teeth bleaching). Uses the latest dental technology including 3D radiographic diagnosis and intraoral scanners for precise treatment planning. Provides personalized treatment based on trust and medical excellence. Financing options available for treatments. Conveniently located on Carrer de Muntaner in the upscale Sarrià-Sant Gervasi district.', 'Carrer de Muntaner, 341, 3º4ª, 08021 Barcelona', 'Barcelona', 'Barcelona', '+34 934 146 404', 'info@clinicablasi.com', 'https://clinicablasi.com/en/', true, false, true, false, NOW(), NOW());
