-- Task 1733: Add Lycée Français de Zamudio - Education - Bilbao
-- French international school serving the Bilbao metropolitan area

DELETE FROM directory_entries
WHERE name = 'Lycée Français de Zamudio'
AND city = 'Zamudio';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Lycée Français de Zamudio
('Lycée Français de Zamudio', 'Schools', 'French international school located in Zamudio, serving the Bilbao metropolitan area. Offers French national curriculum education from preschool through high school (lycée). Multilingual environment with French as the primary language of instruction, along with strong Spanish and English language programs. Provides a multicultural educational experience following the French education system while integrating local Spanish cultural elements. The school prepares students for the French Baccalaureate and welcomes international families, including English-speaking expatriates living in the Basque Country.', 'Parque Tecnológico de Zamudio, 48170 Zamudio', 'Zamudio', 'Bizkaia', '+34 946 712 911', 'secretaria.lfz@lyceefrancaiszamudio.org', 'https://www.lyceefrancaiszamudio.org', true, false, true, false, NOW(), NOW());
