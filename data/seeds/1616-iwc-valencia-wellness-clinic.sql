-- Task 1616: Add IWC Valencia - International Wellness Clinic
-- Data entry by Cletus
-- Source: International Wellness Clinic providing medical services to English-speaking expats in Valencia

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- IWC Valencia - International Wellness Clinic
('IWC Valencia - International Wellness Clinic', 'Doctors', 'International Wellness Clinic in Valencia providing comprehensive medical services to English-speaking expats and international patients. Expat-friendly clinic offering multiple specialties including Dermatology, Cardiology, Psychiatry, Ear-Nose-Throat (ENT), Gynecology (OB-GYN), Trauma & Orthopedics, Pulmonology, and General Medicine. All staff and doctors speak fluent English, with additional language support in French, German, and Italian. Dedicated International Department assists patients with appointment scheduling, insurance coordination, and medical documentation. Modern facilities with patient-centered care approach designed specifically for the needs of expats living in Valencia.', 'Av. Blasco Ibañez 14, 46010 Valencia', 'Valencia', 'Valencia', '+34 963 690 600', 'internationalpatient.val@quiron.com', 'https://www.iwc-valencia.com/medical', true, true, true, false, NOW(), NOW());
