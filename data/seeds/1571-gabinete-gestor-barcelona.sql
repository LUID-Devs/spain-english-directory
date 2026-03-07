-- Task 1571: Add Gabinete Gestor - Gestor Services - Barcelona
-- Data entry by Larry
-- Source: gabinetegestor.com - English-speaking gestor services

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('Gabinete Gestor', 
 'Tax/Accounting', 
 'Professional gestoría and business consultancy in Barcelona with over 50 years of experience serving international clients. Specializes in tax advisory, accounting, payroll management, and business administration for freelancers, small businesses, and individuals. English-speaking staff available to assist expatriates with Spanish tax obligations, company formation, residency permits, and social security registration. Comprehensive services include tax declarations (IRPF, IVA, Impuesto de Sociedades), quarterly and annual accounting, employment contracts and payroll, digital certificate applications, and legal representation before Spanish tax authorities. Experienced team provides personalized attention and clear communication in English throughout the entire process. Located in the Sarria-Sant Gervasi district with easy access via public transport.',
 'Carrer Tenor Viñas, 14, Entlo. 3ª, 08021 Barcelona',
 'Barcelona',
 'Barcelona',
 '+34 93 414 47 14',
 'info@gabinetegestor.com',
 'https://gabinetegestor.com',
 true, 
 false, 
 true, 
 false, 
 NOW(), 
 NOW());
