-- Task 1573: Add InEnglishGestoria - Gestor - Nationwide
-- Data entry for Spain English Directory
-- English-speaking tax and accounting firm based in Tenerife serving clients nationwide

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

-- InEnglishGestoria - Gestor/Accounting services (Puerto de la Cruz-based, nationwide service)
('In English Gestoria', 'Gestor', 'English-speaking tax and accounting firm helping expats, freelancers, digital nomads and companies stay compliant with Spanish tax and accounting obligations. Based in Tenerife with nationwide remote service coverage. Specializes in tax returns and declarations (Modelo 100, 210, 720), autónomo registration and support, business setup and accounting, NIE and residency paperwork assistance, and general Spanish bureaucracy navigation in English. Combines professional expertise with modern ERP-based digital workflows for faster, simpler and more transparent service.', 'Av. Hernando Fernández Perdigón, 6, Piso 7, Apto. 718', 'Puerto de la Cruz', 'Santa Cruz de Tenerife', '+34 642 723 277', 'hola@inenglishgestoria.es', 'https://www.inenglishgestoria.es/', true, false, false, false, NOW(), NOW());
