import sequelize from '../lib/db';
import DirectoryEntry from './DirectoryEntry';
import Claim from './Claim';
import Category from './Category';
import City from './City';
import Lead, { LeadStatus } from './Lead';
import Review from './Review';

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

// Professional is an alias for DirectoryEntry for semantic clarity
export const Professional = DirectoryEntry;

export {
  sequelize,
  DirectoryEntry,
  Claim,
  Category,
  City,
  Lead,
  LeadStatus,
  Review,
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
  Professional: DirectoryEntry,
};
