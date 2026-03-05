import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';
import Category from './Category';
import City from './City';

export enum ListingType {
  FREE = 'free',
  FEATURED = 'featured',
  PREMIUM = 'premium',
}

interface ProfessionalAttributes {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  categoryId: number;
  cityId: number;
  address?: string;
  postalCode?: string;
  description?: string;
  speaksEnglish: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  listingType: ListingType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProfessionalCreationAttributes extends Optional<ProfessionalAttributes, 'id'> {}

class Professional extends Model<ProfessionalAttributes, ProfessionalCreationAttributes> 
  implements ProfessionalAttributes {
  public id!: number;
  public name!: string;
  public email?: string;
  public phone?: string;
  public website?: string;
  public categoryId!: number;
  public cityId!: number;
  public address?: string;
  public postalCode?: string;
  public description?: string;
  public speaksEnglish!: boolean;
  public isVerified!: boolean;
  public isFeatured!: boolean;
  public listingType!: ListingType;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Professional.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    cityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: City,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    speaksEnglish: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    listingType: {
      type: DataTypes.ENUM(...Object.values(ListingType)),
      defaultValue: ListingType.FREE,
      allowNull: false,
    },
  },
  {
    tableName: 'professionals',
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ['categoryId'],
      },
      {
        fields: ['cityId'],
      },
      {
        fields: ['isVerified'],
      },
      {
        fields: ['isFeatured'],
      },
      {
        fields: ['listingType'],
      },
    ],
  }
);

export default Professional;
