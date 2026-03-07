-- Task 1650: Add Animal Salut Veterinary Center - Barcelona
-- Data entry by subagent
-- English-speaking veterinary services in Barcelona for expat pet owners

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('Animal Salut', 
 'Veterinary', 
 'English-speaking veterinary service in Barcelona with over 15 years of experience. Offers both home veterinary service throughout Barcelonès, Garraf, Alt Penedés and surrounding areas, and a full-service veterinary center in La Sagrera neighborhood. Multilingual staff speaks Catalan, Spanish, English and French. Services include general veterinary consultations, vaccinations, microchipping, surgeries, internal medicine for dogs and cats, dermatology, and exotic animal medicine. Home visits available for most treatments including vaccinations, microchipping, and blood tests. Additional services include professional grooming for dogs, cats, and rabbits, plus a specialized pet store with 24-hour ordering for out-of-stock items. The center is validated and registered with the Barcelona Veterinary College (COVB). Founded by Mireia, who specializes in internal medicine for small animals and performs both home visits and center consultations. The team includes 3 professionals: a dog groomer, a veterinarian for the center, and Mireia. Discount packages available for multi-pet families and puppy/kitten vaccination plans.',
 'Calle Olesa 67, 08027 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 933 407 404',
 'info@animalsalut.com',
 'https://www.animalsalut.com/en/',
 true, 
 false, 
 true, 
 false, 
 NOW(), 
 NOW());
