-- Task 1734: Add English Academy Madrid - Educational Services - Madrid
-- English language school and tutoring center for expat families in Madrid

DELETE FROM directory_entries
WHERE name = 'English Academy Madrid'
AND city = 'Madrid';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- English Academy Madrid - Language school for expats and international students
('English Academy Madrid', 'Educational Services', 'Premier English language academy in Madrid offering courses for expat children, adults, and business professionals. Provides Cambridge exam preparation (KET, PET, FCE, CAE, CPE), business English, conversation classes, and private tutoring. Native English-speaking teachers with qualifications in TEFL/TESOL and experience working with international students. Small class sizes ensure personalized attention. Flexible scheduling includes intensive courses, evening classes, and weekend options. Supports students transitioning to English-speaking schools and helps professionals improve business communication skills. Also offers Spanish classes for English speakers.', 'Calle de Serrano, 45, 28006 Madrid', 'Madrid', 'Madrid', '+34 915 62 34 78', 'info@englishacademymadrid.es', 'https://www.englishacademymadrid.es', true, false, true, false, NOW(), NOW());
