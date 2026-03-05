import sequelize from '../lib/db';
import Category from './Category';
import City from './City';
import Professional, { ListingType } from './Professional';
import Review from './Review';
import Lead, { LeadStatus } from './Lead';

// Define associations
Professional.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category' 
});
Category.hasMany(Professional, { 
  foreignKey: 'categoryId', 
  as: 'professionals' 
});

Professional.belongsTo(City, { 
  foreignKey: 'cityId', 
  as: 'city' 
});
City.hasMany(Professional, { 
  foreignKey: 'cityId', 
  as: 'professionals' 
});

Professional.hasMany(Review, { 
  foreignKey: 'professionalId', 
  as: 'reviews' 
});
Review.belongsTo(Professional, { 
  foreignKey: 'professionalId', 
  as: 'professional' 
});

Professional.hasMany(Lead, { 
  foreignKey: 'professionalId', 
  as: 'leads' 
});
Lead.belongsTo(Professional, { 
  foreignKey: 'professionalId', 
  as: 'professional' 
});

export {
  sequelize,
  Category,
  City,
  Professional,
  ListingType,
  Review,
  Lead,
  LeadStatus,
};

export default {
  sequelize,
  Category,
  City,
  Professional,
  Review,
  Lead,
};
