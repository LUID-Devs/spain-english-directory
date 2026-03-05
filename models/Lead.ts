import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

interface LeadAttributes {
  id: number;
  professionalId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  serviceInterest?: string;
  status: LeadStatus;
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'status' | 'emailSent'> {}

class Lead extends Model<LeadAttributes, LeadCreationAttributes> 
  implements LeadAttributes {
  public id!: number;
  public professionalId!: number;
  public name!: string;
  public email!: string;
  public phone?: string;
  public message!: string;
  public serviceInterest?: string;
  public status!: LeadStatus;
  public emailSent!: boolean;
  public emailSentAt?: Date;
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
        model: 'directory_entries',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    serviceInterest: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'service_interest',
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'converted', 'archived'),
      defaultValue: 'new',
      allowNull: false,
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'email_sent',
    },
    emailSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_sent_at',
    },
  },
  {
    tableName: 'leads',
    sequelize,
    timestamps: true,
    indexes: [
      {
        fields: ['professional_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Lead;
