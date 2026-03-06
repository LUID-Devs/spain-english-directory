-- Task 1399: Add The British Dental Clinic - Barcelona
-- Source: Manual research - thebritishdentalclinic.com
-- Category: Dental / Dentists

INSERT INTO directory_entries (
    name, 
    category, 
    description, 
    address, 
    city, 
    province, 
    phone, 
    email, 
    website, 
    speaks_english, 
    is_featured, 
    is_verified, 
    is_claimed, 
    created_at, 
    updated_at
) VALUES (
    'The British Dental Clinic',
    'Dentists',
    'English-speaking dental clinic in Barcelona''s El Born district with over a decade of experience serving the international community. Multilingual team speaking English, Spanish, Catalan, Portuguese, and Arabic. Offers comprehensive dental treatments from routine care to advanced procedures including implantology, orthodontics, and prosthetics. Known for personalized and transparent care with clear explanations of treatment options, outcomes, and costs. Flexible financial plans available to fit different budgets. Centrally located near Barceloneta metro (L4). Same-day appointments available for urgent cases.',
    'Carrer Antic de Sant Joan 13, 08003 Barcelona',
    'Barcelona',
    'Barcelona',
    '+34 607 332 335',
    'info@thebritishdentalclinic.com',
    'https://thebritishdentalclinic.com',
    true,
    false,
    true,
    false,
    NOW(),
    NOW()
);
