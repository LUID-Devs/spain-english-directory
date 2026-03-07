-- Task 1560: Add Costa Medical Services - Healthcare - Malaga
-- Source: Web research - costamedicalservices.com
-- Added: March 7, 2026

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('Costa Medical Services', 
 'Healthcare', 
 'International hospital and medical center in Malaga with a highly qualified team of native English, Swedish, and German doctors and medical staff. Available 24/7, 365 days a year for medical emergencies and general doctor consultations. Comprehensive services include GP doctor consultations, emergency doctor care, ambulance service, telephone doctor consultations, medical and surgery specialists, and laboratory services. Telehealth service available for online consultations Monday-Saturday 09:00-17:00. Works with most international travel insurances including SOS International, VHI, Eurocross, Folksam, and more. Direct billing to insurance companies for in-person visits. Hotel doctor visits arranged immediately upon request.',
 'Calle Fernando Camino 10, 29016 Málaga',
 'Málaga',
 'Málaga',
 '+34 624 64 99 77',
 NULL,
 'https://www.costamedicalservices.com',
 true, 
 false, 
 true, 
 false, 
 NOW(), 
 NOW());
