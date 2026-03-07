-- Task 1653: Add Dr. De Boer / InternationalDoctor.eu - Healthcare - Madrid
-- Data entry for Spain English Directory
-- English-speaking healthcare provider based in Madrid serving expats

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('Dr. De Boer / InternationalDoctor.eu', 'Healthcare', 'English-speaking family doctor and GP providing healthcare services for English-speaking expats in Madrid. Dr. Johanna de Boer offers personalized primary care with native-level English fluency. Services include general consultations, pediatric care, chronic disease management, travel medicine, and home visits. Multilingual physician speaking English, Spanish, Dutch, and Swedish. Offers flexible consultation options including in-person visits in Alcobendas, online/video consultations, and home visits throughout the Madrid metropolitan area. Issues electronic prescriptions valid at all Spanish pharmacies. Highly rated by international patients for clear communication and culturally sensitive care.', 'Alcobendas', 'Madrid', 'Madrid', '+34 603 932 472', 'info@internationaldoctor.eu', 'https://internationaldoctor.eu/', true, false, true, false, NOW(), NOW());
