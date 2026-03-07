-- Task 1653: Add Dr. De Boer / InternationalDoctor.eu - Healthcare - Madrid
-- Data entry for Spain English Directory
-- Source: https://internationaldoctor.eu

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Dr. De Boer - InternationalDoctor.eu - English-Speaking GP for Expats
('Dr. De Boer - InternationalDoctor.eu', 'Doctors', 'English-speaking doctor in Madrid offering personalized medical care for expats, students, and families. Dr. De Boer provides both online and in-person consultations, making healthcare accessible for international residents who prefer English communication. Services include general practice consultations, preventive care, health check-ups, prescription management, and referrals to specialists when needed. Understanding the unique challenges faced by expats navigating the Spanish healthcare system, Dr. De Boer offers compassionate, patient-centered care with clear explanations in English. Convenient online booking system and flexible appointment scheduling accommodate busy international lifestyles.', 'Madrid', 'Madrid', 'Madrid', NULL, 'info@internationaldoctor.eu', 'https://internationaldoctor.eu', true, false, false, false, NOW(), NOW());
