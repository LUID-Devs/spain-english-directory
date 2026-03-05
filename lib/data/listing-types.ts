export interface DirectoryListing {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  isVerified: boolean;
  isFeatured: boolean;
}

export interface ListingsResponse {
  listings: DirectoryListing[];
  total: number;
  page: number;
  totalPages: number;
}
