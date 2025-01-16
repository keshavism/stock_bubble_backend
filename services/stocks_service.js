const { getFormattedDate, getISTDate } = require("../utils/dateAndTime");
const connectionPool = require("./db_service");

module.exports = {
  searchStocksByName: (searchTerm) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        const searchQuery = `
     SELECT 
    symbol,
    MAX(name) AS name,
    MAX(industry) AS industry,
    MAX(series) AS series,
    MAX(instrumentKey) AS instrumentKey,
    MAX(indexName) AS indexName,
    MAX(change5min) AS change5min,
    MAX(change15min) AS change15min,
    MAX(change30min) AS change30min,
    MAX(changeHour) AS changeHour,
    MAX(changeDay) AS changeDay,
    MAX(changeWeek) AS changeWeek,
    MAX(changeMonth) AS changeMonth,
    MAX(changeYear) AS changeYear,
    MAX(volume) AS volume,
    MAX(issueSize) AS issueSize,
    MAX(marketCap) AS marketCap,
    MAX(price) AS price,
    MAX(lastUpdated) AS lastUpdated,
    MAX(securityId) AS securityId,
    MAX(weekPrice) AS weekPrice,
    MAX(monthPrice) AS monthPrice,
    MAX(yearPrice) AS yearPrice,
    MAX(priceArray) AS priceArray
FROM nse_stock_data
WHERE name LIKE ? OR symbol LIKE ?
GROUP BY symbol
ORDER BY lastUpdated DESC;


        `;
        const likeTerm = `%${searchTerm}%`;
        connection.query(searchQuery, [likeTerm, likeTerm], (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(results);
        });
      });
    });
  },

  getStockByInstrumentKey: (id) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const selectQuery = "SELECT * FROM stocks WHERE transaction_id = ?";
        connection.query(selectQuery, [id], (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(results[0]);
        });
      });
    });
  },

  getInstrumentKeys: (indexName) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const selectQuery = `
            SELECT instrumentKey,issueSize,symbol,securityId,price,weekPrice,monthPrice,yearPrice FROM nse_stock_data where indexName = ? and lastUpdated NOT LIKE ?
        `;
        const date = getISTDate();
        const likeQueryParam = `%${date}%`;
        connection.query(
          selectQuery,
          [indexName, likeQueryParam],
          (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }
            resolve(results);
          }
        );
      });
    });
  },

  getNotUpdatedStocks: () => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const selectQuery = `
        SELECT instrumentKey, issueSize, indexName,securityId,price,weekPrice,monthPrice,yearPrice
        FROM nse_stock_data 
        WHERE lastUpdated NOT LIKE ?
        `;

        const date = getISTDate();
        const likeQueryParam = `%${date}%`; // Adding the '%' wildcards
        console.log(selectQuery, likeQueryParam); // For debugging

        connection.query(selectQuery, [likeQueryParam], (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(results);
        });
      });
    });
  },

  getStocksByIndex: (indexName) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const selectQuery = `
            SELECT * FROM nse_stock_data where indexName=?
        `;
        connection.query(selectQuery, [indexName], (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(results);
        });
      });
    });
  },

  updateStockData: (instrumentKey, data) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET 
      change5min = ?, change15min = ?, change30min = ?, changeHour = ?, 
      changeDay = ?, changeWeek = ?, changeMonth = ?, changeYear = ? , price =? ,marketCap=? , lastUpdated=?,volume=?
      WHERE instrumentKey = ?`;
        connection.query(
          updateQuery,
          [
            data.change5min,
            data.change15min,
            data.change30min,
            data.changeHour,
            data.changeDay,
            data.changeWeek,
            data.changeMonth,
            data.changeYear,
            data.price,
            data.marketCap,
            data.date,
            data.volumne,
            instrumentKey,
          ],
          (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }

            resolve({ message: "Transactions updated successfully!" });
          }
        );
      });
    });
  },

  updateYearlyStockData: (instrumentKey, yearPrice) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET 
      yearPrice = ?
      
      WHERE instrumentKey = ?`;
        connection.query(
          updateQuery,
          [yearPrice, instrumentKey],
          (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }

            resolve({ message: "Transactions updated successfully!" });
          }
        );
      });
    });
  },
  updateDailyData: (instrumentKey, price, date) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET 
      price = ?,lastUpdated=?
      
      WHERE instrumentKey = ?`;
        connection.query(
          updateQuery,
          [price, date, instrumentKey],
          (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }

            resolve({ message: "Transactions updated successfully!" });
          }
        );
      });
    });
  },
  updateMonthlyStockData: (instrumentKey, monthPrice) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET 
      monthPrice = ?
      
      WHERE instrumentKey = ?`;
        connection.query(
          updateQuery,
          [monthPrice, data?.date, instrumentKey],
          (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }

            resolve({ message: "Transactions updated successfully!" });
          }
        );
      });
    });
  },
  updateWeeeklyStockData: (instrumentKey, weekPrice) => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET 
      weekPrice = ?
      
      WHERE instrumentKey = ?`;
        connection.query(
          updateQuery,
          [weekPrice, instrumentKey],
          (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }

            resolve({ message: "Transactions updated successfully!" });
          }
        );
      });
    });
  },
  updateWeekPrices: () => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET weekPrice = price`;
        connection.query(updateQuery, (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }

          resolve({ message: "Transactions updated successfully!" });
        });
      });
    });
  },
  updateMonthPrices: () => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET monthPrice = price`;
        connection.query(updateQuery, (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }

          resolve({ message: "Transactions updated successfully!" });
        });
      });
    });
  },
  updateYearPrices: () => {
    return new Promise((resolve, reject) => {
      connectionPool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const updateQuery = `UPDATE nse_stock_data SET yearPrice = price`;
        connection.query(updateQuery, (err, results) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
            return;
          }

          resolve({ message: "Transactions updated successfully!" });
        });
      });
    });
  },
};
