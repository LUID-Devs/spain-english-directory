-- Task 1513: Add Dr. David Deardon - Doctor - Marbella
-- English-speaking surgeon and GP, British Surgical Clinic
-- Location: Marbella, Costa del Sol
-- Source: ESHA Spain directory, British Surgical Clinic website
-- Added: March 7, 2026

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('Dr. David Deardon', 
 'Doctors', 
 'Internationally recognised surgeon and English-speaking doctor at the British Surgical Clinic in Marbella. Dr. Deardon trained in the UK (Southampton University, BM 1984) and USA, and established the British Surgical Clinic to provide UK-style surgical expertise for the expatriate community on the Costa del Sol. Specialises in general surgery with a focus on patient care for English-speaking residents and visitors between Gibraltar, Marbella and Malaga.',
 'Edificio Mayoral, Avda Severo Ochoa s/n, 29603 Marbella',
 'Marbella',
 'Málaga',
 '+34 951 703 243',
 'info@thebritishsurgicalclinic.com',
 'https://thebritishsurgicalclinic.com',
 true, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW());