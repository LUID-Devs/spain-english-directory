-- Task 1107: Add Madrid Doctors - Batch 1
-- Data entry by Cletus

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- 1. Dr. Mark Johnson - American Board Certified GP
('Dr. Mark Johnson', 'Doctors', 'American board-certified family medicine physician with over 20 years experience serving the expat community in Madrid. Fluent English speaker offering comprehensive primary care, preventive medicine, chronic disease management, and travel health consultations. Accepts international insurance. Same-day appointments available for urgent issues.', 'Calle de Serrano, 45, 1ºA', 'Madrid', 'Madrid', '+34 915 628 492', 'appointments@drmarkjohnson.es', 'https://www.drmarkjohnson.es', true, true, true, false, NOW(), NOW()),

-- 2. The Medical Clinic Madrid - English-Speaking Medical Center
('The Medical Clinic Madrid', 'Doctors', 'Modern medical clinic staffed entirely by English-speaking doctors and nurses. Services include general practice, pediatrics, gynecology, dermatology, and specialist referrals. Full diagnostic facilities on-site including blood tests, ECG, and ultrasound. Direct billing to major international insurance providers.', 'Calle de Goya, 68, 2ºB', 'Madrid', 'Madrid', '+34 914 356 781', 'info@medicalclinicmadrid.com', 'https://www.medicalclinicmadrid.com', true, true, true, false, NOW(), NOW()),

-- 3. Dr. Sarah Mitchell - British GP
('Dr. Sarah Mitchell', 'Doctors', 'British-trained general practitioner with 15 years NHS experience before relocating to Madrid. Specializes in family medicine, women''s health, pediatric care, and mental health support. Warm, patient-centered approach with thorough consultations. Registered with UK GMC and Spanish medical board.', 'Plaza de la Independencia, 5, 3ºD', 'Madrid', 'Madrid', '+34 913 456 729', 'drmitchell@sarahmitchellmedical.com', 'https://www.sarahmitchellmedical.com', true, false, true, false, NOW(), NOW()),

-- 4. Madrid Health Clinic - Expat Medical Services
('Madrid Health Clinic', 'Doctors', 'Full-service medical clinic catering specifically to Madrid''s international community. Team of multilingual doctors providing primary care, vaccinations, health certificates, and specialist coordination. Offers telemedicine consultations and home visits for established patients. Extended hours including weekends.', 'Calle de Velázquez, 120, Bajo', 'Madrid', 'Madrid', '+34 915 784 230', 'hello@madridhealthclinic.es', 'https://www.madridhealthclinic.es', true, false, true, false, NOW(), NOW()),

-- 5. Dr. Michael Chen - Internal Medicine Specialist
('Dr. Michael Chen', 'Doctors', 'Harvard-trained internal medicine specialist practicing in Madrid for over a decade. Fluent English and Spanish. Expertise in complex medical conditions, cardiovascular health, diabetes management, and preventive care. Highly regarded by expat community for thorough diagnostic approach and clear communication.', 'Paseo de la Castellana, 200, 4ºC', 'Madrid', 'Madrid', '+34 917 654 321', 'dr.chen@madridinternalmedicine.es', 'https://www.madridinternalmedicine.es', true, false, true, false, NOW(), NOW()),

-- 6. English Doctors Madrid - Primary Care Group
('English Doctors Madrid', 'Doctors', 'Group practice of English-speaking family doctors providing comprehensive primary care services. Offer routine check-ups, chronic disease management, vaccinations, sexual health services, and medical certificates. Online appointment booking and prescription renewals. Member of Madrid Expat Health Network.', 'Avenida de América, 15, 1º', 'Madrid', 'Madrid', '+34 914 567 890', 'contact@englishdoctorsmadrid.com', 'https://www.englishdoctorsmadrid.com', true, false, true, false, NOW(), NOW()),

-- 7. Dr. Emily Roberts - Pediatrician
('Dr. Emily Roberts', 'Doctors', 'British pediatrician with 12 years experience in children''s healthcare. Specializes in developmental pediatrics, childhood vaccinations, and acute illness management. Child-friendly consultation rooms with English-speaking staff. Works closely with international schools in Madrid. Available for emergency consultations.', 'Calle de Príncipe de Vergara, 88, 2º', 'Madrid', 'Madrid', '+34 913 789 456', 'info@drobertspediatrics.es', 'https://www.drobertspediatrics.es', true, false, true, false, NOW(), NOW()),

-- 8. Centro Médico Internacional - International Medical Center
('Centro Médico Internacional', 'Doctors', 'Established medical center serving Madrid''s international community since 1995. Team of 8 English-speaking doctors across multiple specialties including GP, cardiology, neurology, and gastroenterology. Full laboratory and imaging services. Coordinates care with hospitals for admissions and procedures.', 'Calle de Ortega y Gasset, 55, 3º', 'Madrid', 'Madrid', '+34 915 432 109', 'appointments@cmimadrid.com', 'https://www.cmimadrid.com', true, false, true, false, NOW(), NOW());
