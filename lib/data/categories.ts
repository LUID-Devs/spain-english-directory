export const categories = [
  { 
    slug: 'doctors', 
    name: 'Doctors', 
    singular: 'Doctor',
    specialties: ['General Practice', 'Pediatrics', 'Cardiology', 'Dermatology', 'Orthopedics', 'Internal Medicine', 'Gynecology', 'ENT', 'Ophthalmology', 'Psychiatry']
  },
  { 
    slug: 'translators', 
    name: 'Translators', 
    singular: 'Translator',
    specialties: ['Legal Translation', 'Medical Translation', 'Technical Translation', 'Sworn Translation', 'Business Translation', 'Marketing Translation', 'Interpreter Services', 'Document Translation', 'Website Localization', 'Certified Translation']
  },
  { 
    slug: 'lawyers', 
    name: 'Lawyers', 
    singular: 'Lawyer',
    specialties: ['Immigration', 'Real Estate', 'Family Law', 'Criminal Defense', 'Business Law', 'Tax Law', 'Employment', 'Civil Litigation', 'Intellectual Property', 'Wills & Probate']
  },
  { 
    slug: 'dentists', 
    name: 'Dentists', 
    singular: 'Dentist',
    specialties: ['General Dentistry', 'Orthodontics', 'Oral Surgery', 'Periodontics', 'Endodontics', 'Cosmetic Dentistry', 'Pediatric Dentistry', 'Prosthodontics', 'Implants', 'Emergency Dentistry']
  },
  { 
    slug: 'accountants', 
    name: 'Accountants', 
    singular: 'Accountant',
    specialties: ['Personal Tax', 'Business Accounting', 'Audit', 'Payroll', 'VAT', 'Financial Planning', 'Bookkeeping', 'Expat Tax', 'Corporate Tax', 'Forensic Accounting']
  },
  { 
    slug: 'therapists', 
    name: 'Therapists', 
    singular: 'Therapist',
    specialties: ['Psychology', 'Counseling', 'Family Therapy', 'Cognitive Behavioral', 'Trauma', 'Addiction', 'Anxiety & Depression', 'Relationship', 'Child Therapy', 'Life Coaching']
  },
  { 
    slug: 'veterinarians', 
    name: 'Veterinarians', 
    singular: 'Veterinarian',
    specialties: ['Small Animals', 'Large Animals', 'Exotic Pets', 'Surgery', 'Dentistry', 'Emergency Care', 'Internal Medicine', 'Oncology', 'Dermatology', 'Behavioral Medicine']
  },
  { 
    slug: 'realtors', 
    name: 'Realtors', 
    singular: 'Realtor',
    specialties: ['Sales', 'Rentals', 'Commercial', 'Luxury Properties', 'New Developments', 'Property Management', 'Investment', 'Relocation', 'Holiday Rentals', 'Land & Plots']
  },
  { 
    slug: 'mechanics', 
    name: 'Mechanics', 
    singular: 'Mechanic',
    specialties: ['General Repair', 'Bodywork', 'Electrical', 'AC Service', 'Transmission', 'Engine', 'Diagnostics', 'MOT/ITV Prep', 'Classic Cars', 'Motorcycles']
  },
  { 
    slug: 'hairdressers', 
    name: 'Hairdressers', 
    singular: 'Hairdresser',
    specialties: ['Cut & Style', 'Color', 'Highlights', 'Balayage', 'Extensions', 'Barbering', 'Bridal', 'Curly Hair', 'Treatments', 'Children']
  },
  { 
    slug: 'fitness-trainers', 
    name: 'Fitness Trainers', 
    singular: 'Fitness Trainer',
    specialties: ['Personal Training', 'Yoga', 'Pilates', 'CrossFit', 'Strength', 'Weight Loss', 'Rehabilitation', 'Sports Specific', 'Group Classes', 'Nutrition']
  },
  { 
    slug: 'gestors', 
    name: 'Gestors', 
    singular: 'Gestor',
    specialties: ['Vehicle Transfers', 'Driving Licence Exchange', 'NIE Registration', 'Vehicle Import', 'Autónomo Registration', 'Tax Filing', 'Digital Certificates', 'Visa Applications', 'Property Registration', 'Bureaucracy Support']
  },
  { 
    slug: 'physiotherapists', 
    name: 'Physiotherapists', 
    singular: 'Physiotherapist',
    specialties: ['Sports Injury', 'Rehabilitation', 'Manual Therapy', 'Post-Surgery Rehab', 'Back Pain', 'Neck Pain', 'Joint Mobilization', 'Massage Therapy', 'Athletic Performance', 'Chronic Pain']
  },
  { 
    slug: 'insurance-brokers', 
    name: 'Insurance Brokers', 
    singular: 'Insurance Broker',
    specialties: ['Health Insurance', 'Home Insurance', 'Car Insurance', 'Life Insurance', 'Travel Insurance', 'Business Insurance', 'Expat Insurance', 'Dental Insurance', 'Pet Insurance', 'Liability Insurance']
  },
  {
    slug: 'coworking-spaces',
    name: 'Coworking Spaces',
    singular: 'Coworking Space',
    specialties: ['Hot Desks', 'Dedicated Desks', 'Private Offices', 'Meeting Rooms', 'Community Events', 'High-Speed Internet', '24/7 Access', 'Virtual Office', 'Business Address', 'Networking']
  },
  {
    slug: 'business-services',
    name: 'Business Services',
    singular: 'Business Service',
    specialties: ['Company Formation', 'Virtual Office', 'Administrative Support', 'Payroll Setup', 'Business Consulting', 'Compliance', 'Commercial Registrations', 'Relocation Support', 'Tax Registration', 'Operational Support']
  },
  {
    slug: 'educational-services',
    name: 'Educational Services',
    singular: 'Educational Service',
    specialties: ['Student Orientation', 'Visa Support', 'Accommodation Guidance', 'Academic Advising', 'Scholarship Support', 'Campus Integration', 'Document Translation', 'Exam Preparation', 'Tutoring', 'Student Wellness']
  },
  {
    slug: 'language-schools',
    name: 'Language Schools',
    singular: 'Language School',
    specialties: ['Spanish Intensive', 'DELE Preparation', 'Small Group Classes', 'Private Lessons', 'Cultural Immersion', 'Conversation Clubs', 'Online Classes', 'Business Spanish', 'University Pathway', 'Visa Support']
  },
  {
    slug: 'medical-clinics',
    name: 'Medical Clinics',
    singular: 'Medical Clinic',
    specialties: ['Primary Care', 'Student Health', 'Travel Health', 'Vaccinations', 'Diagnostics', 'Specialist Referrals', 'Telemedicine', 'Mental Health', 'Wellness Checks', 'English-Speaking Staff']
  },
  {
    slug: 'hospitals',
    name: 'Hospitals',
    singular: 'Hospital',
    specialties: ['Emergency Care', 'Surgery', 'Diagnostics', 'Maternity', 'Pediatrics', 'Cardiology', 'Oncology', 'Orthopedics', 'Intensive Care', 'Rehabilitation']
  },
] as const;

export type CategorySlug = typeof categories[number]['slug'];

export const isValidCategory = (slug: string): slug is CategorySlug => {
  return categories.some(c => c.slug === slug);
};

export const getCategoryBySlug = (slug: string) => {
  return categories.find(c => c.slug === slug);
};
