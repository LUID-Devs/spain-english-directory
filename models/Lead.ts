import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';
import Professional from './Professional';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  CLOSED = 'closed',
}

interface LeadAttributes {
  id: number;
  professionalId: number;
  requesterName: string;
  requesterEmail: string;
  message: string;
  status: LeadStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadCreationAttributes extends Optional<LeadAttributes, 'id'> {}

class Lead extends Model<LeadAttributes, LeadCreationAttributes> 
  implements LeadAttributes {
  public id!: number;
  public professionalId!: number;
  public requesterName!: string;
  public requesterEmail!: string;
  public message!: string;
  public status!: LeadStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lead.init(
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
    requesterName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    requesterEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LeadStatus)),
      defaultValue: LeadStatus.NEW,
      allowNull: false,
    },
  },
  {
    tableName: 'leads',
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ['professionalId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Lead;
