/**
 * Professional Dashboard Types
 */

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description: string;
  services: string[];
  hours: BusinessHours;
  photoUrl?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  category: string;
  claimed: boolean;
  claimedBy?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  monday?: { open: string; close: string; closed: boolean };
  tuesday?: { open: string; close: string; closed: boolean };
  wednesday?: { open: string; close: string; closed: boolean };
  thursday?: { open: string; close: string; closed: boolean };
  friday?: { open: string; close: string; closed: boolean };
  saturday?: { open: string; close: string; closed: boolean };
  sunday?: { open: string; close: string; closed: boolean };
}

export interface Lead {
  id: string;
  professionalId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  profileViews: number;
  totalLeads: number;
  newLeads: number;
  conversionRate: number;
}

export interface UpdateProfessionalRequest {
  name?: string;
  description?: string;
  services?: string[];
  hours?: BusinessHours;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  photoUrl?: string;
}
