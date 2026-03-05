import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

interface ReviewAttributes {
  id: number;
  professionalId: number;
  reviewerName: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes {
  public id!: number;
  public professionalId!: number;
  public reviewerName!: string;
  public rating!: number;
  public comment?: string;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    professionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'directory_entries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    reviewerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
      { fields: ['professionalId'] },
    ],
  }
);

export default Review;
