-- Task 1732: Add Trivium Abogados - Legal - Palma de Mallorca
-- English-speaking law firm in Palma de Mallorca for expats and international clients

DELETE FROM directory_entries
WHERE name = 'Trivium Abogados'
AND city = 'Palma de Mallorca';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Trivium Abogados - English-speaking law firm in Palma de Mallorca
('Trivium Abogados', 'Lawyers', 'English-speaking law firm in Palma de Mallorca providing comprehensive legal services for expats, international residents, and foreign investors. Specializes in Spanish immigration law including Golden Visa applications, non-lucrative visas, and digital nomad visas. Expertise in real estate conveyancing, property law, and commercial transactions for international clients. Offers guidance on tax planning, estate planning, wills, and probate matters. The multilingual team provides clear communication in English throughout all legal processes, ensuring clients understand their rights and obligations under Spanish law. Assists with company formation, business law, and regulatory compliance for entrepreneurs and businesses establishing operations in the Balearic Islands. Personalized service with transparent pricing and dedicated account managers for ongoing legal support.', 'Carrer del Far Cap de la Nau, 18, 07012 Palma de Mallorca', 'Palma de Mallorca', 'Balearic Islands', '+34 971 21 05 40', 'info@triviumabogados.com', 'https://www.triviumabogados.com', true, false, true, false, NOW(), NOW());
