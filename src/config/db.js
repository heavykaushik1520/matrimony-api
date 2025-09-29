
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', 
    logging: false, 
  }
);

// Function to test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    // You might want to throw the error to crash the application if the DB is essential
  }
};

module.exports = {
  sequelize,
  testConnection,
};