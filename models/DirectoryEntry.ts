import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

export type ClaimStatus = 'unclaimed' | 'pending' | 'verified' | 'approved' | 'rejected';

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
  claimStatus: ClaimStatus;
  claimedBy?: string;
  claimEmail?: string;
  claimPhone?: string;
  claimVerificationCode?: string;
  claimVerificationExpiry?: Date;
  claimRequestedAt?: Date;
  claimApprovedAt?: Date;
  claimApprovedBy?: string;
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
  public claimStatus!: ClaimStatus;
  public claimedBy?: string;
  public claimEmail?: string;
  public claimPhone?: string;
  public claimVerificationCode?: string;
  public claimVerificationExpiry?: Date;
  public claimRequestedAt?: Date;
  public claimApprovedAt?: Date;
  public claimApprovedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DirectoryEntry.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    claimStatus: {
      type: DataTypes.ENUM('unclaimed', 'pending', 'verified', 'approved', 'rejected'),
      defaultValue: 'unclaimed',
      allowNull: false,
    },
    claimedBy: {
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
    claimApprovedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    claimApprovedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'directory_entries',
    sequelize,
    timestamps: true,
  }
);

export default DirectoryEntry;
