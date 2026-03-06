-- Task 1485: Add Centro Medico Maria - Medical Clinic - Valencia
-- Data entry by Rupert
-- Source: Research on English-speaking medical clinic for Valencia expats
-- Medical Director: Dr. Christian Boteanu

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Centro Medico Maria - Expat Clinic Valencia - English-speaking medical clinic
('Centro Medico Maria', 'Doctors', 'Medical clinic specifically established to serve Valencia\'s expat community with English-speaking doctors and multilingual staff. Founded as the first expat-dedicated clinic in Valencia, Centro Medico Maria offers accessible medical services to English, French, and Romanian-speaking expats at reasonable rates, with or without insurance. Led by Medical Director Dr. Christian Boteanu, the clinic provides comprehensive services including general medicine, family medicine, medical laboratory tests, rapid COVID-19 tests with 24-hour results in multiple languages, ultrasound imaging, physiotherapy, psychology, and specialized medical examinations for driving licenses and marriage certificates. The multilingual team ensures clear communication throughout the entire patient experience from phone booking to consultation. Flexible appointments available Monday through Saturday. Located near Nuevo Center Mall and Turia Park (Turia metro station).', 'Avenida Menendez Pidal 3, Bajo Izquierda, 46009 Valencia', 'Valencia', 'Valencia', '+34 641 361 833', 'info.centromedicomaria@gmail.com', 'https://centromedicomaria.es', true, false, true, false, NOW(), NOW());
