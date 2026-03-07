export interface DirectoryEntry {
  id: number;
  name: string;
  category: string;
  description?: string;
  address?: string;
  city: string;
  province?: string;
  phone?: string;
  email?: string;
  website?: string;
  speaksEnglish: boolean;
  isClaimed: boolean;
  claimedBy?: string;
  claimedAt?: string;
  ownerUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ClaimStatus = 'pending' | 'verified' | 'approved' | 'rejected';
export type ClaimRelationship = 'owner' | 'employee' | 'authorized';

export interface Claim {
  id: number;
  directoryEntryId: number;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  relationship?: ClaimRelationship;
  documentUrl?: string;
  verificationCode: string;
  verificationCodeExpiresAt: string;
  status: ClaimStatus;
  isVerified: boolean;
  verifiedAt?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  directoryEntry?: DirectoryEntry;
}

export interface ClaimFormData {
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  relationship?: ClaimRelationship;
  documentUrl?: string;
}
