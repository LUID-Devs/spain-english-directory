export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  serviceInterest?: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  leadId?: number;
}

export interface LeadType {
  id: number;
  professionalId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  serviceInterest?: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Professional {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  address?: string;
  city: string;
  province?: string;
  phone?: string;
  email?: string;
  website?: string;
  speaksEnglish: boolean;
}
