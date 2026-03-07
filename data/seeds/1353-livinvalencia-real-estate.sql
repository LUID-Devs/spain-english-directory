-- Task 1353: Add LivinValencia Real Estate Advisors
-- Data entry for LivinValencia real estate agency in Valencia

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Livin'Valencia - Independent real estate and relocation advisors
('Livin''Valencia Real Estate Advisors', 'Real Estate', 'Independent real estate advisory service helping international families, retirees, and professionals buy, rent and relocate to Valencia with clarity and confidence. Founded in 2011 by expats who went through the relocation process themselves. They work exclusively for buyers on a fixed-fee basis with no seller commissions, ensuring unbiased advice. Services include whole-market property search, neighborhood guidance, school search assistance, administrative support (NIE, padrón, bank accounts, insurance, visa assistance for non-EU clients), and connections to trusted lawyers, tax advisors, and contractors. Multilingual team speaks English, Spanish, French, and Italian. Free 15-minute introductory video call available.', 'Valencia City Center', 'Valencia', 'Valencia', '+34 963 21 99 12', 'info@livinvalencia.com', 'https://livinvalencia.com', true, false, true, false, NOW(), NOW());
