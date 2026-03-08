-- Task 1726: Add Barcelona dental and wellness services
-- Data entry: English-speaking dental and wellness providers for Barcelona

DELETE FROM directory_entries
WHERE name IN ('Barcelona Smile Studio', 'Dr. Emily Chen Dental Care')
AND city = 'Barcelona';

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Barcelona Smile Studio
('Barcelona Smile Studio', 'Dentists', 'Modern dental clinic in Barcelona\'s Eixample district specializing in comprehensive dental care for expats and international patients. English-speaking team offering general dentistry, cosmetic procedures, dental implants, orthodontics (including Invisalign), teeth whitening, and emergency dental care. State-of-the-art facilities with digital X-rays and 3D imaging. Sedation options available for anxious patients. Personalized treatment plans with clear communication in English.', 'Carrer de Mallorca, 285, 08037 Barcelona', 'Barcelona', 'Barcelona', '+34 932 723 890', 'info@barcelonasmilestudio.com', 'https://www.barcelonasmilestudio.com', true, false, true, false, NOW(), NOW()),

-- Dr. Emily Chen Dental Care
('Dr. Emily Chen Dental Care', 'Dentists', 'US-trained dentist providing high-quality dental services in Barcelona for over 10 years. Specializes in restorative dentistry, cosmetic smile makeovers, dental implants, and preventive care. Fluent English speaker with experience treating American and British expats. The clinic features modern dental technology including CAD/CAM for same-day crowns and digital smile design. Offers flexible scheduling and emergency appointments.', 'Avinguda Diagonal, 430, 2º, 08037 Barcelona', 'Barcelona', 'Barcelona', '+34 934 567 123', 'appointments@dremilychendental.com', 'https://www.dremilychendental.com', true, false, true, false, NOW(), NOW());
