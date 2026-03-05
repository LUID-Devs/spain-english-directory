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
  claimedBy?: number | null;
  claimedAt?: Date | null;
  isVerified: boolean;
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
  public claimedBy?: number | null;
  public claimedAt?: Date | null;
  public isVerified!: boolean;
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
    claimedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'claims',
        key: 'id',
      },
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
  }
);

export default DirectoryEntry;
