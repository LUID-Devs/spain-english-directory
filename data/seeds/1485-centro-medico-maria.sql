-- Task 1485: Add Centro Medico Maria - Medical Clinic - Valencia
-- Data entry by Cletus
-- Source: The Olive Press Spain article + business directory research
-- Website: http://www.centromedicomaria.es
-- Note: Expat-focused medical clinic with English-speaking doctors

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Centro Medico Maria - English-speaking medical clinic for expats in Valencia
('Centro Medico Maria', 'Doctors', 'Expat-focused medical clinic in Valencia offering accessible healthcare services to English and French speaking expats. Provides general medicine, family medicine, medical laboratory tests, rapid tests, ultrasound, and physiotherapy services in English. Founded by Dr. Christian Boteanu, the clinic aims to serve the growing English-speaking community in the Valencia Community. The entire patient experience is conducted in English - from phone appointments to consultations. Located near Nuevo Center Mall and Turia Park. Appointments can be made by phone or through their website.', 'Avenida Menendez Pidal 3, Bajo Izquierda, 46009', 'Valencia', 'Valencia', '+34 641 361 833', NULL, 'http://www.centromedicomaria.es', true, false, true, false, NOW(), NOW());
