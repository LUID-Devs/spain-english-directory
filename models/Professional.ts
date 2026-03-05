import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';
import City from './City';
import Category from './Category';

interface ProfessionalAttributes {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  cityId: number;
  categoryId: number;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProfessionalCreationAttributes extends Optional<ProfessionalAttributes, 'id'> {}

class Professional extends Model<ProfessionalAttributes, ProfessionalCreationAttributes> 
  implements ProfessionalAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public address?: string;
  public phone?: string;
  public email?: string;
  public website?: string;
  public cityId!: number;
  public categoryId!: number;
  public isFeatured!: boolean;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public city?: City;
  public category?: Category;
}

Professional.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
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
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
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
  },
  {
    tableName: 'professionals',
    sequelize,
    timestamps: true,
  }
);

export default Professional;
