import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';
import Professional from './Professional';

interface ReviewAttributes {
  id: number;
  professionalId: number;
  rating: number;
  comment?: string;
  reviewerName: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> 
  implements ReviewAttributes {
  public id!: number;
  public professionalId!: number;
  public rating!: number;
  public comment?: string;
  public reviewerName!: string;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    professionalId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Professional,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: 'reviews',
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ['professionalId'],
      },
      {
        fields: ['rating'],
      },
    ],
  }
);

export default Review;
