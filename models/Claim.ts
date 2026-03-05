import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';
import DirectoryEntry from './DirectoryEntry';

export type ClaimStatus = 'pending' | 'verified' | 'approved' | 'rejected';
export type ClaimRelationship = 'owner' | 'employee' | 'authorized';

interface ClaimAttributes {
  id: number;
  directoryEntryId: number;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  relationship?: ClaimRelationship;
  documentUrl?: string;
  verificationCode: string;
  verificationCodeExpiresAt: Date;
  status: ClaimStatus;
  isVerified: boolean;
  verifiedAt?: Date;
  reviewedBy?: number;
  reviewedAt?: Date;
  rejectionReason?: string;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClaimCreationAttributes extends Optional<ClaimAttributes, 'id'> {}

class Claim extends Model<ClaimAttributes, ClaimCreationAttributes>
  implements ClaimAttributes {
  public id!: number;
  public directoryEntryId!: number;
  public claimantName!: string;
  public claimantEmail!: string;
  public claimantPhone?: string;
  public relationship?: ClaimRelationship;
  public documentUrl?: string;
  public verificationCode!: string;
  public verificationCodeExpiresAt!: Date;
  public status!: ClaimStatus;
  public isVerified!: boolean;
  public verifiedAt?: Date;
  public reviewedBy?: number;
  public reviewedAt?: Date;
  public rejectionReason?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Association
  public directoryEntry?: DirectoryEntry;
}

Claim.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    directoryEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'directory_entries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    claimantName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    claimantEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    claimantPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    relationship: {
      type: DataTypes.ENUM('owner', 'employee', 'authorized'),
      allowNull: true,
    },
    documentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    verificationCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    verificationCodeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'claims',
    sequelize,
    timestamps: true,
    underscored: true,
  }
);

export default Claim;
