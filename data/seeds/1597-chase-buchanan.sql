-- Task 1597: Add Chase Buchanan - Financial Advisors - Multi-City Spain
-- Data entry for Spain English Directory
-- Fully regulated wealth management firm providing financial advice for expats across Spain

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Chase Buchanan - Marbella Office (Costa del Sol coverage)
('Chase Buchanan Wealth Management', 'Tax/Accounting', 'Fully regulated wealth management firm specializing in financial advice for British and international expats living in Spain. Expert guidance on UK pension transfers (SIPPs and QROPS), investment management, Spanish tax planning including Modelo 720 declarations, estate planning with Spanish wills, and residency visa applications. Local advisers with in-depth knowledge of both UK and Spanish tax systems. Services include retirement planning, wealth management, inheritance tax planning, and compliance with Spanish tax residency rules. Regulated by the Cyprus Securities and Exchange Commission with European headquarters.', 'Avda. Ricardo Soriano, 72; Edificio Golden Portal B, 1ª Planta', 'Marbella', 'Málaga', NULL, NULL, 'https://chasebuchanan.com/', true, false, false, false, NOW(), NOW()),

-- Chase Buchanan - Valencia Office (Mediterranean coast coverage)
('Chase Buchanan Wealth Management', 'Tax/Accounting', 'Fully regulated wealth management firm specializing in financial advice for British and international expats living in Spain. Expert guidance on UK pension transfers (SIPPs and QROPS), investment management, Spanish tax planning including Modelo 720 declarations, estate planning with Spanish wills, and residency visa applications including Non-Lucrative and Digital Nomad visas. Local advisers with in-depth knowledge of both UK and Spanish tax systems. Services include retirement planning, wealth management, inheritance tax planning, and compliance with Spanish tax residency rules.', 'Avenida de Aragón 30', 'Valencia', 'Valencia', NULL, NULL, 'https://chasebuchanan.com/', true, false, false, false, NOW(), NOW());
