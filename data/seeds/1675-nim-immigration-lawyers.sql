-- Task 1675: Update NIM Immigration Lawyers Barcelona - Legal (Digital Nomad Specialists)
-- Updates existing entry from task #1397 with enhanced name and description

UPDATE directory_entries SET
  name = 'NIM Immigration Lawyers Barcelona - Digital Nomad Specialists',
  description = 'Digital-first immigration law firm specializing in Digital Nomad Visas and Spanish residency for remote workers, freelancers, and international entrepreneurs. Based in Barcelona with a fully online service model designed for the digital nomad lifestyle. Offers free initial consultations, secure document upload portal, and digital case tracking for seamless remote service. Core expertise includes Digital Nomad Visa applications, Non-Lucrative Visa, Golden Visa, Family Reunification, Student Visa, and Spanish work permits. Additional services include tax registration (modelo 036/037), social security setup, NIE number applications, residency card renewals, and Beckham Law compliance for high-earning expats. Led by CEO Irene Marti Gispert, the English-speaking team provides transparent fixed pricing with no hidden fees and clear communication throughout the entire immigration process. Modern, tech-forward approach eliminates traditional barriers with flexible scheduling, video consultations, and digital-first workflows perfect for location-independent professionals seeking to establish residency in Spain.',
  updated_at = NOW()
WHERE email = 'info@nimextranjeria.com' AND website = 'https://nimextranjeria.com';
