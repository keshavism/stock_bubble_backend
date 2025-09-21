require("dotenv").config();

const PORT = process.env.PORT || 5000;
const DB_DETAILS = {
  connectionLimit: 100,
  host: process.env.MYSQL_DB_HOSTNAME,
  user: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_SCHEMA,
  connectTimeout: 10000, // 10 seconds
  // timeout: 120000, // 120 seconds
};

module.exports = {
  PORT: PORT,
  ACCESS_TOKEN: ACCESS_TOKEN,
  DB_DETAILS: DB_DETAILS,
};
