require("dotenv").config();

const PORT = process.env.PORT || 5000;
const DB_DETAILS = {
  connectionLimit: 100,
  host: process.env.MYSQL_DB_HOSTNAME,
  user: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_SCHEMA,
  connectTimeout: 120000, // 120 seconds
  timeout: 120000, // 120 seconds
};
const ACCESS_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzQwNzQxOTU2LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMDM3MzQ5MSJ9.BfoM1E_rpgOttHJgr-w6oXPVny-B9M9pdmO0BzyJYPf3y_alzMrYJQ0WuaqZ31PlYRg5r6__O5C5uhW1lfqqJg";

module.exports = {
  PORT: PORT,
  ACCESS_TOKEN: ACCESS_TOKEN,
  DB_DETAILS: DB_DETAILS,
};
