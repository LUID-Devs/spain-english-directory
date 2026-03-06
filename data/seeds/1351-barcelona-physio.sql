-- Task 1351: Add Barcelona Physio - Physiotherapy - Barcelona
-- Data entry by Julio
-- English-speaking physiotherapy clinic in Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Barcelona Physio - UK-trained English-speaking physiotherapist
('Barcelona Physio', 'Physiotherapy', 'Established physiotherapy clinic serving expats in Barcelona. Run by Lucy, a UK-trained physiotherapist providing full physiotherapy assessment and treatment services in English. Specialized in caring for international residents and English-speaking patients seeking professional physiotherapy care.', NULL, 'Barcelona', 'Barcelona', NULL, NULL, 'https://barcelonaphysio.com/home/', true, false, true, false, NOW(), NOW());
