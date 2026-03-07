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
] as const;

export type CategorySlug = typeof categories[number]['slug'];

export const isValidCategory = (slug: string): slug is CategorySlug => {
  return categories.some(c => c.slug === slug);
};

export const getCategoryBySlug = (slug: string) => {
  return categories.find(c => c.slug === slug);
};
