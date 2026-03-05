import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/db';

export type ClaimStatus = 'pending' | 'verified' | 'approved' | 'rejected';

interface ClaimAttributes {
  id: number;
  directoryEntryId: number;
  name: string;
  email: string;
  phone: string;
  documentUrl?: string | null;
  verificationCode: string;
  status: ClaimStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClaimCreationAttributes
  extends Optional<ClaimAttributes, 'id' | 'status' | 'documentUrl'> {}

class Claim
  extends Model<ClaimAttributes, ClaimCreationAttributes>
  implements ClaimAttributes
{
  public id!: number;
  public directoryEntryId!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public documentUrl?: string | null;
  public verificationCode!: string;
  public status!: ClaimStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Claim.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    directoryEntryId: {
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
      allowNull: false,
    },
    documentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    verificationCode: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'claims',
    sequelize,
    timestamps: true,
  }
);

export default Claim;
