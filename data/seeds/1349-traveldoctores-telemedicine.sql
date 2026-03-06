-- Task 1349: Add TravelDoctores - Telemedicine - Madrid
-- Data entry by Cletus
-- Source: https://traveldoctores.com

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- TravelDoctores - Online Telemedicine Service for Travelers
('TravelDoctores', 'Telemedicine', 'Online medical service connecting international travelers, expats, and digital nomads with licensed doctors in Spain through secure video consultations. Speak with an English-speaking GP in under 10 minutes. Flat rate of €30 per consultation includes the video call and digital prescription if needed. Services include urgent care for minor injuries, cold and flu symptoms, stomach issues, travel-related illnesses, prescription renewals, and medical certificates. Available 24/7 with doctors active on weekends and holidays. Payment via secure credit/debit card through Revolut. Invoices available for travel insurance reimbursement. Serves travelers in Madrid, Barcelona, and across Spain and Europe.', 'Online service - Based in Barcelona', 'Madrid', 'Madrid', '+34 675 060 210', 'traveldoctores@gmail.com', 'https://traveldoctores.com', true, true, true, false, NOW(), NOW());
