import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

interface DirectoryEntryAttributes {
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
  isFeatured: boolean;
  isVerified: boolean;
  isClaimed: boolean;
  claimStatus?: 'unclaimed' | 'pending' | 'verified' | 'approved' | 'rejected';
  claimApprovedAt?: Date;
  claimApprovedBy?: string;
  claimEmail?: string;
  claimPhone?: string;
  claimVerificationCode?: string;
  claimVerificationExpiry?: Date;
  claimRequestedAt?: Date;
  claimedBy?: string;
  claimedAt?: Date;
  ownerUserId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DirectoryEntryCreationAttributes extends Optional<DirectoryEntryAttributes, 'id'> {}

class DirectoryEntry extends Model<DirectoryEntryAttributes, DirectoryEntryCreationAttributes> 
  implements DirectoryEntryAttributes {
  public id!: number;
  public name!: string;
  public category!: string;
  public description?: string;
  public address?: string;
  public city!: string;
  public province?: string;
  public phone?: string;
  public email?: string;
  public website?: string;
  public speaksEnglish!: boolean;
  public isFeatured!: boolean;
  public isVerified!: boolean;
  public isClaimed!: boolean;
  public claimStatus?: 'unclaimed' | 'pending' | 'verified' | 'approved' | 'rejected';
  public claimApprovedAt?: Date;
  public claimApprovedBy?: string;
  public claimEmail?: string;
  public claimPhone?: string;
  public claimVerificationCode?: string;
  public claimVerificationExpiry?: Date;
  public claimRequestedAt?: Date;
  public claimedBy?: string;
  public reviews?: any[];
  public claimedAt?: Date;
  public ownerUserId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DirectoryEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    speaksEnglish: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isClaimed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    claimStatus: {
      type: DataTypes.ENUM('unclaimed', 'pending', 'verified', 'approved', 'rejected'),
      allowNull: true,
    },
    claimApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    claimApprovedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    claimEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    claimPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    claimVerificationCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    claimVerificationExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    claimRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    claimedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ownerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'directory_entries',
    sequelize,
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['city'] },
      { fields: ['category'] },
      { fields: ['isFeatured'] },
      { fields: ['isVerified'] },
      { fields: ['name', 'description'] },
    ],
  }
);

export default DirectoryEntry;
