-- Task 1626: Add Spain Lawyer (Spainlawyer.com) - Legal - Madrid
-- Data entry for Spain English Directory
-- Leading provider of legal assistance for English-speaking individuals and businesses in Spain

-- Clean up any existing entries to prevent duplicates
DELETE FROM directory_entries WHERE name = 'Spain Lawyer' OR website = 'https://www.spainlawyer.com/';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Spain Lawyer - Madrid-based law firm serving English-speaking clients throughout Spain
('Spain Lawyer', 'Legal', 'Leading provider of legal assistance and services for English-speaking individuals and businesses in Spain. Founded in 2001, this Madrid-based law firm has over 20 years of experience providing comprehensive legal services in civil, criminal, family, labour and administrative matters. Offers legal advice by telephone, email, private chat, and in-person consultations. Practice areas include conveyancing assistance (property purchase/sale, contract review, mortgage consultations), wills and probate, taxes in Spain, immigration matters, criminal defense (including driving cases), and business setup. Provides nationwide coverage through a network of local offices across Spain including Madrid, Barcelona, Valencia, Marbella, Ibiza, Mallorca, Canary Islands, and more. Pre-packaged legal services available for fixed one-off prices.', 'Paseo de la Castellana, 179 Ascensor C, 1ª Planta', 'Madrid', 'Madrid', NULL, 'admin@iabogado.com', 'https://www.spainlawyer.com/', true, false, false, false, NOW(), NOW());
