import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

export const LeadStatus = {
  NEW: 'new' as const,
  CONTACTED: 'contacted' as const,
  CONVERTED: 'converted' as const,
  CLOSED: 'closed' as const,
};

export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];

interface LeadAttributes {
  id: number;
  professionalId: number;
  requesterName: string;
  requesterEmail: string;
  message: string;
  status: LeadStatusType;
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
  public status!: LeadStatusType;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lead.init(
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
        model: 'professionals',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    requesterName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    requesterEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'converted', 'closed'),
      defaultValue: 'new',
      allowNull: false,
    },
  },
  {
    tableName: 'leads',
    sequelize,
    timestamps: true,
  }
);

export default Lead;
