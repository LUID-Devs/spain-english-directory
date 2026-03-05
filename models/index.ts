import sequelize from '../lib/db';
import DirectoryEntry from './DirectoryEntry';
import Claim from './Claim';
import Category from './Category';
import City from './City';
import Lead, { LeadStatus } from './Lead';
import Review from './Review';
import ProfessionalModel, { ListingType } from './Professional';

// Professional is an alias for DirectoryEntry to maintain backwards compatibility with API routes
export const Professional = DirectoryEntry;

// Export the new Professional model for new features
export { ProfessionalModel };

// Define associations for DirectoryEntry (also used by Professional alias)
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

// Define associations for ProfessionalModel (new professionals table)
ProfessionalModel.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

ProfessionalModel.belongsTo(City, {
  foreignKey: 'cityId',
  as: 'city',
});

Category.hasMany(ProfessionalModel, {
  foreignKey: 'categoryId',
  as: 'professionals',
});

City.hasMany(ProfessionalModel, {
  foreignKey: 'cityId',
  as: 'professionals',
});

export {
  sequelize,
  DirectoryEntry,
  Claim,
  Category,
  City,
  Lead,
  LeadStatus,
  Review,
  ListingType,
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
