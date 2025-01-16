const jwt = require("jsonwebtoken");
const {
  JWT_USER_SECRET,
  JWT_WAREHOUSE_SECRET,
  JWT_MUMBAI_WAREHOUSE_SECRET,
  JWT_ADMIN_SECRET,
} = require("../config/server.config");

const authToken = (secret) => {
  return (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
      return res
        .status(400)
        .json({ message: "No token provided.", success: false });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.error(err);
        return res
          .status(401)
          .json({ message: "Invalid token.", success: false });
      }
      req.user = decoded;

      next();
    });
  };
};

const userAuthToken = authToken(JWT_USER_SECRET);
const mumbaiWarehouseAuthToken = authToken(JWT_MUMBAI_WAREHOUSE_SECRET);
const warehouseAuthToken = authToken(JWT_WAREHOUSE_SECRET);
const adminAuthToken = authToken(JWT_ADMIN_SECRET);

module.exports = {
  userAuthToken,
  mumbaiWarehouseAuthToken,
  warehouseAuthToken,
  adminAuthToken,
};
