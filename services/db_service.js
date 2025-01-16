const mysql = require("mysql2");

const config = require("../config/config");

const connectionPool = mysql.createPool(config.DB_DETAILS);

module.exports = connectionPool;
