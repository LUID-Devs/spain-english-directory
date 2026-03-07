-- Task 1640: Add VetEnCasa - House Call Vet Barcelona
-- Source: Web research - vetencasa.es, Yelp, WhoDoYou
-- Issue: #1640
-- Added: March 7, 2026

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('VetEnCasa', 
 'Veterinary', 
 'English-speaking veterinary house call service for pets in the Barcelona Metropolitan Area. Team of veterinarians providing home visits for dogs, cats, and small animals throughout Barcelona city and surrounding areas. Services include general checkups, vaccinations, minor treatments, and emergency assessments in the comfort of your home. Ideal for pets who experience anxiety at clinics, elderly animals with mobility issues, or busy pet owners seeking convenient veterinary care. English-speaking staff ensures clear communication for expat pet owners. House call service eliminates the stress of transporting pets to a clinic.',
 'Servicio a domicilio en área metropolitana de Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 654 834 230',
 NULL,
 'http://www.vetencasa.es',
 true, 
 false, 
 false, 
 false, 
 NOW(), 
 NOW());
