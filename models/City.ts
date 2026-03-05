import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

interface CityAttributes {
  id: number;
  name: string;
  slug: string;
  province: string;
  region: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CityCreationAttributes extends Optional<CityAttributes, 'id'> {}

class City extends Model<CityAttributes, CityCreationAttributes> 
  implements CityAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public province!: string;
  public region!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

City.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'cities',
    sequelize,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug'],
      },
    ],
  }
);

export default City;
