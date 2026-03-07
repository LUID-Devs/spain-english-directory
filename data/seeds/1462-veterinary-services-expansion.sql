-- Task 1462: Expand Veterinary Services Coverage
-- Adds 6 veterinary clinics across Valencia, Madrid, and Marbella.

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
) VALUES
('Upendi Clínica Veterinaria', 'Veterinary', 'Modern veterinary clinic in Valencia Eixample with preventive, diagnostic, and hospitalization services.', 'Carrer de l''Església del Patraix, 11, 46005 Valencia', 'Valencia', 'Valencia', '+34 960 660 513', 'info@upendiclinicaveterinaria.com', 'https://upendiclinicaveterinaria.com/', true, false, true, false, NOW(), NOW()),
('Clínica Veterinaria El Palau', 'Veterinary', 'Veterinary center in Valencia focused on surgery, traumatology, and general companion-animal care.', 'Carrer del Doctor Sanchis Bergón, 20, 46005 Valencia', 'Valencia', 'Valencia', '+34 963 744 302', 'info@clinicaelpalau.es', 'https://clinicaelpalau.es/', true, false, true, false, NOW(), NOW()),
('Hospital Veterinario Alberto Alcocer', 'Veterinary', '24-hour veterinary hospital in Madrid with emergency, surgery, and diagnostics.', 'Av. Alberto Alcocer, 45, 28016 Madrid', 'Madrid', 'Madrid', '+34 913 452 515', 'info@hospitalveterinarioalbertoalcocer.com', 'https://www.hospitalveterinarioalbertoalcocer.com/', true, true, true, false, NOW(), NOW()),
('Medivet Los Sauces - Hospital Veterinario 24h', 'Veterinary', '24/7 veterinary hospital in Madrid with strong exotic-animal and emergency coverage.', 'Calle de Santa Engracia, 63, 28010 Madrid', 'Madrid', 'Madrid', '+34 914 454 305', 'cvsauces@cvsauces.com', 'https://cvsauces.com/', true, true, true, false, NOW(), NOW()),
('Pointer Veterinary Marbella', 'Veterinary', 'Marbella veterinary clinic with preventive plans and emergency support for expat pet owners.', 'Calle Láncara, 2, Local 4, 29660 Marbella, Málaga', 'Marbella', 'Málaga', '+34 952 770 033', 'info@pointermarbella.com', 'https://www.pointermarbella.com/', true, false, true, false, NOW(), NOW()),
('Clínica Veterinaria Marbella mediVET', 'Veterinary', 'Marbella clinic serving international clients with preventive and general veterinary care.', 'Calle Lagasca, 8, 29660 Marbella, Málaga', 'Marbella', 'Málaga', '+34 952 829 511', 'info@clinicaveterinariamedivet.com', 'https://www.clinicaveterinariamedivet.com/en/', true, false, true, false, NOW(), NOW());
