-- Task 1408: Add C&D Solicitors - Legal - Málaga/Torrox
-- Data entry for English-speaking legal services

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- C&D Solicitors - Torrox (Málaga)
('C&D Solicitors', 'Legal', 'English-speaking property lawyers specializing in property purchases, sales, and inheritance law in Andalusia since 2006. Licensed lawyers (members of the Malaga Bar Association) with multilingual support including English, Dutch, Swedish, German, and French. Offers comprehensive legal services including due diligence investigations, contract review, Power of Attorney representation, notary deed signing, property registration, and tax declarations. Personalized approach with quick and efficient service for clients who often do not live in Spain. Professional liability insured. Free parking available near office.', 'Calle La Noria s/n, Edif. Recreo II, 1-15 - 29793 Torrox-Costa', 'Torrox', 'Málaga', '+34 952 53 25 82', 'info@cdsolicitors.com', 'https://www.cdsolicitors.com', true, false, false, false, NOW(), NOW());
