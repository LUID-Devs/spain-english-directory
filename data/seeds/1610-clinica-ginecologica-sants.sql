-- Task 1610: Add Clínica Ginecológica Sants - Gynecology - Barcelona
-- Data entry by Cletus
-- English-speaking gynecology clinic in Sants, Barcelona

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Clínica Ginecológica Sants - English-Speaking Gynecology Clinic
('Clínica Ginecológica Sants', 'Doctors', 'English-speaking gynecology clinic located in the Sants neighborhood of Barcelona. Led by Dr. Andreu Farran Cano, specializing in comprehensive women''s health care including routine gynecological check-ups, prenatal care, fertility counseling, menopause management, and minimally invasive gynecological surgery. The clinic offers personalized care with modern diagnostic equipment and a patient-centered approach. Services include ultrasound diagnostics, colposcopy, HPV screening, contraceptive counseling, and treatment of gynecological conditions. The team provides compassionate care for women at all life stages, from adolescence through menopause, with particular attention to expat patients seeking English-speaking medical care in Barcelona.', 'Carrer de Sants, 79', 'Barcelona', 'Barcelona', '+34 934 90 18 75', 'info@clinicaginecologicasants.com', 'https://www.clinicaginecologicasants.com', true, false, true, false, NOW(), NOW());
