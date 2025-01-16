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
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzM3MzYyMzI0LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMDM3MzQ5MSJ9.XYaAF4wHy3gQCFARROKD4NFGWyCWTLvK2id9kWWYe1NFS6iAV609IsrcIg4rUIVgpYIhv7p6mSSro7XqSNxV4A";

module.exports = {
  PORT: PORT,
  ACCESS_TOKEN: ACCESS_TOKEN,
  DB_DETAILS: DB_DETAILS,
};
