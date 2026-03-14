export interface DirectoryListing {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  description: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
}
