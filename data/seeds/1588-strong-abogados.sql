-- Task 1588: Add Strong Abogados - Legal - Barcelona/Madrid
-- Data entry for Spain English Directory
-- English-speaking law firm with offices in Barcelona and Madrid

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Barcelona Office
('Strong Abogados', 'Legal', 'Firm of English-speaking lawyers providing a full range of business and real estate services to international clients. Specializes in company formation, corporate law, property transactions, immigration, intellectual property, e-commerce, inheritance and wills, accounting, VAT registration, and payroll services. Founded in 2000 with extensive experience working exclusively with international clients. Offers personalized service with clear communication in English throughout the legal process. Part of Auralaw network and Wong and Fleming alliance providing access to over 100 professionals across major cities.', 'Carrer de Balmes, 177', 'Barcelona', 'Barcelona', '+34 932 155 393', 'info@strongabogados.com', 'https://www.strongabogados.com/', true, false, false, false, NOW(), NOW()),

-- Madrid Office
('Strong Abogados', 'Legal', 'Firm of English-speaking lawyers providing a full range of business and real estate services to international clients. Specializes in company formation, corporate law, property transactions, immigration, intellectual property, e-commerce, inheritance and wills, accounting, VAT registration, and payroll services. Founded in 2000 with main office in Madrid and associated offices across Spain. Offers personalized service with clear communication in English throughout the legal process. Part of Auralaw network and Wong and Fleming alliance providing access to over 100 professionals across major cities.', 'Calle de Fuencarral, 139, 2C', 'Madrid', 'Madrid', '+34 932 155 393', 'info@strongabogados.com', 'https://www.strongabogados.com/', true, false, false, false, NOW(), NOW());
