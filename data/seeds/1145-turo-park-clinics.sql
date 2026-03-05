-- Task 1145: Add Turó Park Clinics - Healthcare - Madrid
-- Data entry by Cletus
-- Note: Physical clinic is in Barcelona but offers online/telemedicine services specifically for Madrid residents

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- Turó Park Clinics - English-speaking medical services for Madrid residents via telemedicine
('Turó Park Clinics', 'Healthcare', 'English-speaking medical clinic providing comprehensive healthcare services to Madrid residents through telemedicine and online consultations. Offers a wide range of medical specialties including pediatrics, dentistry, orthodontics, infectious diseases, travel medicine, nutrition, dermatology, otolaryngology (ENT), cardiology, gynecology, physiotherapy, aesthetic medicine and cosmetic surgery. All doctors, nurses and administrative staff speak fluent English. Experienced in remote diagnosis and electronic prescriptions valid at Madrid pharmacies. Works with international insurance companies. Multilingual team also speaks Spanish, French and other languages.', 'Plaça de Sant Gregori Taumaturg, 5, 08021 Barcelona (Online/Telemedicine for Madrid)', 'Madrid', 'Madrid', '+34 932 529 729', 'contact@turoparkmedical.com', 'https://turoparkmedical.com/english-speaking-doctor-madrid/', true, false, true, false, NOW(), NOW());
