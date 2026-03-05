import sequelize from '../lib/db';
import DirectoryEntry from './DirectoryEntry';
import Claim from './Claim';
import Professional from './Professional';
import Category from './Category';
import City from './City';
import Review from './Review';
import Lead, { LeadStatus } from './Lead';

// DirectoryEntry <-> Claim associations
DirectoryEntry.hasMany(Claim, {
  foreignKey: 'directoryEntryId',
  as: 'claims',
});

Claim.belongsTo(DirectoryEntry, {
  foreignKey: 'directoryEntryId',
  as: 'directoryEntry',
});

// Professional <-> City associations
Professional.belongsTo(City, {
  foreignKey: 'cityId',
  as: 'city',
});

City.hasMany(Professional, {
  foreignKey: 'cityId',
  as: 'professionals',
});

// Professional <-> Category associations
Professional.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

Category.hasMany(Professional, {
  foreignKey: 'categoryId',
  as: 'professionals',
});

// Professional <-> Review associations
Professional.hasMany(Review, {
  foreignKey: 'professionalId',
  as: 'reviews',
});

Review.belongsTo(Professional, {
  foreignKey: 'professionalId',
  as: 'professional',
});

// Professional <-> Lead associations
Professional.hasMany(Lead, {
  foreignKey: 'professionalId',
  as: 'leads',
});

Lead.belongsTo(Professional, {
  foreignKey: 'professionalId',
  as: 'professional',
});

export { sequelize, DirectoryEntry, Claim, Professional, Category, City, Review, Lead, LeadStatus };
export default { sequelize, DirectoryEntry, Claim, Professional, Category, City, Review, Lead };
