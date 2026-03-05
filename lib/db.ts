import { Sequelize } from 'sequelize';

// Lazy initialization to avoid build-time database connection
let sequelize: Sequelize | undefined;

function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'spain_english_directory',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }
  return sequelize;
}

export { getSequelize };
export default getSequelize;
