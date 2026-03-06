-- Task 1470: Add Clinica Dental Llopis Diaz - Dental - Valencia
-- Data entry by subagent
-- Source: Reddit r/valencia - "The kindest you will find. And very low cost. The primary dentist speaks English."
-- Located in Burjassot, accessible via Metro line 1 from Valencia

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clinica Dental Llopis Diaz - English-Speaking Dental Clinic in Burjassot (Valencia area)
('Clinica Dental Llopis Diaz', 'Dental', 'Highly recommended English-speaking dental clinic in Burjassot, easily accessible from Valencia city via Metro line 1. Known as "the kindest you will find" according to Reddit users. Very low cost compared to other options in the area. The primary dentist speaks English, making it ideal for expats and English-speaking patients who need dental care. Friendly, helpful service with a willingness to assist international patients. Source: Reddit r/valencia recommendation - "The kindest you will find. And very low cost. I can provide all info you want... The primary dentist speaks English."', 'Burjassot', 'Valencia', 'Valencia', NULL, NULL, NULL, true, false, true, false, NOW(), NOW());
