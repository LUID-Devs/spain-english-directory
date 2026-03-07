import sequelize from '../lib/db';
import DirectoryEntry from './DirectoryEntry';
import Claim from './Claim';
import Category from './Category';
import City from './City';
import Lead, { LeadStatus } from './Lead';
import Review from './Review';
import Professional, { ListingType, EnglishLevel as ProfessionalEnglishLevel } from './Professional';
import { EnglishLevel as DirectoryEntryEnglishLevel } from './DirectoryEntry';

// Define associations
DirectoryEntry.hasMany(Claim, {
  foreignKey: 'directoryEntryId',
  as: 'claims',
});

Claim.belongsTo(DirectoryEntry, {
  foreignKey: 'directoryEntryId',
  as: 'directoryEntry',
});

DirectoryEntry.hasMany(Lead, {
  foreignKey: 'professionalId',
  as: 'leads',
});

Lead.belongsTo(DirectoryEntry, {
  foreignKey: 'professionalId',
  as: 'professional',
});

DirectoryEntry.hasMany(Review, {
  foreignKey: 'professionalId',
  as: 'reviews',
});

Review.belongsTo(DirectoryEntry, {
  foreignKey: 'professionalId',
  as: 'professional',
});

export {
  sequelize,
  DirectoryEntry,
  DirectoryEntryEnglishLevel,
  Claim,
  Category,
  City,
  Lead,
  LeadStatus,
  Review,
  Professional,
  ListingType,
  ProfessionalEnglishLevel,
};

export default {
  sequelize,
  DirectoryEntry,
  Claim,
  Category,
  City,
  Lead,
  LeadStatus,
  Review,
  Professional,
  ListingType,
};
