require("dotenv").config();

const PORT = process.env.PORT || 5000;
const JWT_ADMIN_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "1y";

module.exports = {
  PORT,
  JWT_ADMIN_SECRET,
  JWT_EXPIRY,
};
