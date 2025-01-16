// stockController.js
const stockService = require("../services/stocks_service");
const upstockService = require("../services/upstox_service");
const dhanService = require("../services/dhan_service");
const { formatToISTTime } = require("../utils/dateAndTime");
const RATE_LIMIT_PER_SECOND = 10; // API limit: 25 requests per second
const BATCH_SIZE = RATE_LIMIT_PER_SECOND;

/**
 * Delay function to pause execution for a certain number of milliseconds
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// const updateStockData = async (req, res) => {
const updateStockData = async (indexName, type) => {
  try {
    const instrumentKeys = await stockService.getInstrumentKeys(indexName);
    // const instrumentKeys = [
    //   { instrumentKey: "INE075A01022", issueSize: 5229944078.0 },
    // ];
    const fetchDataPromises = instrumentKeys.map(async (instrumentKey) => {
      await updateUpstockData(instrumentKey, type);
    });

    await Promise.all(fetchDataPromises);
  } catch (error) {
    console.error("Error updating stock data:", error);
  }
};
const updateUpstockData = async (instrumentKey, type) => {
  const date = formatToISTTime();

  try {
    const intradayData = await upstockService.fetchIntradayData(
      instrumentKey?.instrumentKey,
      type
    );
    const totalVolumeTraded = intradayData?.data.candles.reduce(
      (sum, candle) => sum + candle[5],
      0
    );

    const latestPrice = intradayData?.data.candles[0][4];
    // Calculate the average price of the day using High and Low prices
    const highPrice = Math.max(
      ...intradayData?.data.candles.map((candle) => candle[2])
    );
    const lowPrice = Math.min(
      ...intradayData?.data.candles.map((candle) => candle[3])
    );
    const averagePrice = (highPrice + lowPrice) / 2;

    // Calculate the Daily Trading Volume (₹)
    const dailyTradingVolume = averagePrice * totalVolumeTraded;
    let percentageChange =
      ((latestPrice - parseFloat(instrumentKey?.price)) /
        parseFloat(instrumentKey?.price)) *
      100;
    const changeDay = parseFloat(percentageChange.toFixed(2));

    percentageChange =
      ((latestPrice - parseFloat(instrumentKey?.weekPrice)) /
        parseFloat(instrumentKey?.weekPrice)) *
      100;
    const changeWeek = parseFloat(percentageChange.toFixed(2));

    percentageChange =
      ((latestPrice - parseFloat(instrumentKey?.monthPrice)) /
        parseFloat(instrumentKey?.monthPrice)) *
      100;
    const changeMonth = parseFloat(percentageChange.toFixed(2));

    percentageChange =
      ((latestPrice - parseFloat(instrumentKey?.yearPrice)) /
        parseFloat(instrumentKey?.yearPrice)) *
      100;
    const changeYear = parseFloat(percentageChange.toFixed(2));
    const changes = {
      change5min: calculatePercentageChange(intradayData, latestPrice, 5),
      change15min: calculatePercentageChange(intradayData, latestPrice, 15),
      change30min: calculatePercentageChange(intradayData, latestPrice, 30),
      changeHour: calculatePercentageChange(intradayData, latestPrice, 60),
      changeDay,
      changeWeek,
      changeMonth,
      changeYear,
      price: latestPrice,
      marketCap: parseFloat(latestPrice) * parseFloat(instrumentKey?.issueSize),
      date: date,
      volumne: dailyTradingVolume,
    };
    await stockService.updateStockData(instrumentKey?.instrumentKey, changes);
  } catch (error) {
    console.error("Error updating stock data:", error);
  }
};
const updateDailyData = async (indexName, type, instrument) => {
  try {
    const instrumentKeys = await stockService.getInstrumentKeys(indexName);
    const date = formatToISTTime();

    for (let i = 0; i < instrumentKeys.length; i += BATCH_SIZE) {
      const batch = instrumentKeys.slice(i, i + BATCH_SIZE);

      // Fetch data for the current batch
      const fetchDataPromises = batch.map(async (instrumentKey) => {
        if (instrumentKey?.securityId) {
          const intradayData = await dhanService.fetchIntradayData(
            instrumentKey?.securityId,
            type,
            instrument
          );

          const totalVolumeTraded = intradayData?.volume?.reduce(
            (acc, currentVolume) => acc + currentVolume,
            0
          );

          const highestClose = Math.max(...intradayData?.close);
          const lowestClose = Math.min(...intradayData?.close);

          const averagePrice = (highestClose + lowestClose) / 2;
          // Calculate the Daily Trading Volume (₹)
          const dailyTradingVolume = averagePrice * totalVolumeTraded;
          const latestPrice = getDhanClosePrice(intradayData);

          const changes = {
            change5min: calculateDhanPercentageChange(
              intradayData,
              latestPrice,
              5
            ),
            change15min: calculateDhanPercentageChange(
              intradayData,
              latestPrice,
              15
            ),
            change30min: calculateDhanPercentageChange(
              intradayData,
              latestPrice,
              30
            ),
            changeHour: calculateDhanPercentageChange(
              intradayData,
              latestPrice,
              60
            ),
            changeDay: calculateDhanPercentageChange(
              instrumentKey?.price,
              latestPrice,
              "day"
            ),
            changeWeek: calculateDhanPercentageChange(
              instrumentKey?.weekPrice,
              latestPrice,
              "week"
            ),
            changeMonth: calculateDhanPercentageChange(
              instrumentKey?.monthPrice,
              latestPrice,
              "month"
            ),
            changeYear: calculateDhanPercentageChange(
              instrumentKey?.yearPrice,
              latestPrice,
              "year"
            ),
            price: latestPrice,
            marketCap:
              parseFloat(latestPrice) * parseFloat(instrumentKey?.issueSize),
            date: date,
            volumne: dailyTradingVolume,
          };
          await stockService.updateStockData(
            instrumentKey?.instrumentKey,
            changes
          );
        } else {
          await updateUpstockData(instrumentKey, type);
        }
      });

      // Wait for all the requests in the current batch to complete
      await Promise.all(fetchDataPromises);

      // If there are more requests, wait for 1 second to respect the rate limit
      if (i + BATCH_SIZE < instrumentKeys.length) {
        console.log(`Waiting for 1 second to respect the rate limit...`);
        await delay(1000); // Delay for 1 second
      }
    }

    console.log(`Successfully updated stock data for ${indexName}`);
  } catch (error) {
    console.error("Error updating stock data:", error);
  }
};
const updateTimeframeStockData = async (
  indexName,
  type,
  instrument,
  timeframe
) => {
  try {
    const instrumentKeys = await stockService.getInstrumentKeys(indexName);
    const date = formatToISTTime();

    for (let i = 0; i < instrumentKeys.length; i += BATCH_SIZE) {
      const batch = instrumentKeys.slice(i, i + BATCH_SIZE);

      // Fetch data for the current batch
      const fetchDataPromises = batch.map(async (instrumentKey) => {
        if (instrumentKey?.securityId) {
          let data;
          // Fetch data based on the timeframe
          if (timeframe === "weekly") {
            data = await dhanService.fetchWeeklyData(
              instrumentKey?.symbol,
              type,
              instrument
            );
          } else if (timeframe === "monthly") {
            data = await dhanService.fetchMonthlyData(
              instrumentKey?.symbol,
              type,
              instrument
            );
          } else if (timeframe === "yearly") {
            data = await dhanService.fetchYearlyData(
              instrumentKey?.symbol,
              type,
              instrument
            );
          } else if (timeframe === "day") {
            data = await dhanService.fetchHistoricalData(
              instrumentKey?.symbol,
              type,
              instrument
            );
          }

          const price = getDhanClosePrice(data[`${timeframe}Data`]);
          console.log(instrumentKey?.instrumentKey, price);
          // Update stock data based on the timeframe
          if (timeframe === "weekly") {
            await stockService.updateWeeeklyStockData(
              instrumentKey?.instrumentKey,
              price
            );
          } else if (timeframe === "monthly") {
            await stockService.updateMonthlyStockData(
              instrumentKey?.instrumentKey,
              price
            );
          } else if (timeframe === "yearly") {
            await stockService.updateYearlyStockData(
              instrumentKey?.instrumentKey,
              price
            );
          } else if (timeframe === "day") {
            await stockService.updateDailyData(
              instrumentKey?.instrumentKey,
              price,
              date
            );
          }
        } else {
          await updateUpstockHistoricalData(instrumentKey, type);
        }
      });

      // Wait for all the requests in the current batch to complete
      await Promise.all(fetchDataPromises);

      // Respect the rate limit
      if (i + BATCH_SIZE < instrumentKeys.length) {
        console.log(`Waiting for 1 second to respect the rate limit...`);
        await delay(1000); // Delay for 1 second
      }
    }

    console.log(
      `Successfully updated ${timeframe} stock data for ${indexName}`
    );
  } catch (error) {
    console.error(`Error updating ${timeframe} stock data:`, error);
  }
};
const updateUpstockHistoricalData = async (instrumentKey, type) => {
  try {
    const date = formatToISTTime();

    const { dayData, weekData, monthData, yearData } =
      await upstockService.fetchHistoricalData(
        instrumentKey?.instrumentKey,
        type
      );
    console.log(getStartPrice(dayData));
    const price = getStartPrice(dayData);

    await stockService.updateDailyData(
      instrumentKey?.instrumentKey,
      price,
      date
    );
  } catch (error) {
    console.error("Error updating stock data:", error);
  }
};
// Wrapper functions for different timeframes
const updateWeeklyStockData = (indexName, type, instrument) => {
  return updateTimeframeStockData(indexName, type, instrument, "weekly");
};
const updateDailyHistoricalData = (indexName, type, instrument) => {
  return updateTimeframeStockData(indexName, type, instrument, "day");
};

const updateMonthlyStockData = (indexName, type, instrument) => {
  return updateTimeframeStockData(indexName, type, instrument, "monthly");
};

const updateYearlyStockData = (indexName, type, instrument) => {
  return updateTimeframeStockData(indexName, type, instrument, "yearly");
};

const updatRemainingStocks = async () => {
  try {
    const instrumentKeys = await stockService.getNotUpdatedStocks();
    for (let i = 0; i < instrumentKeys.length; i += 10) {
      const batch = instrumentKeys.slice(i, i + 10);
      const fetchDataPromises = await batch.map(async (instrumentKey) => {
        console.log(instrumentKey);
        let type = "NSE_EQ";
        if (
          instrumentKey?.indexName === "sector_index" ||
          instrumentKey?.indexName === "nifty_index"
        ) {
          type = "NSE_INDEX";
        } else if (instrumentKey?.indexName === "sensex_30") {
          type = "BSE_EQ";
        } else if (instrumentKey?.indexName === "sensex_index") {
          type = "BSE_INDEX";
        }
        await updateUpstockData(instrumentKey, type);
      });

      await Promise.all(fetchDataPromises);

      // Respect the rate limit
      if (i + BATCH_SIZE < instrumentKeys.length) {
        console.log(`Waiting for 1 second to respect the rate limit...`);
        await delay(1000); // Delay for 1 second
      }
    }

    console.log("Successfully updated remaining stock data.");
  } catch (error) {
    console.error("Error updating stock data:", error);
  }
};

const getStocksByIndex = async (req, res) => {
  try {
    const niftyData = await stockService.getStocksByIndex("nifty_index");
    const sensexData = await stockService.getStocksByIndex("sensex_index");
    const stocks = await stockService.getStocksByIndex(req.params.indexName);
    const calculatedStocks = stocks.map((stock) => {
      const niftyRelativeChange = calculateNiftyRelativeChange(
        stock,
        niftyData[0]
      );
      const sensexRelativeChange = calculateSensexRelativeChange(
        stock,
        sensexData[0]
      );
      return {
        ...stock,
        ...niftyRelativeChange,
        ...sensexRelativeChange,
      };
    });

    return res.status(200).json({
      data: calculatedStocks,
      message: "Stock data fetched successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const calculateNiftyRelativeChange = (stock, indexData) => {
  return {
    niftyRelativeChange5min:
      parseFloat(stock.change5min) - parseFloat(indexData.change5min),
    niftyRelativeChange15min:
      parseFloat(stock.change15min) - parseFloat(indexData.change15min),
    niftyRelativeChange30min:
      parseFloat(stock.change30min) - parseFloat(indexData.change30min),
    niftyRelativeChangeHour:
      parseFloat(stock.changeHour) - parseFloat(indexData.changeHour),
    niftyRelativeChangeDay:
      parseFloat(stock.changeDay) - parseFloat(indexData.changeDay),
    niftyRelativeChangeWeek:
      parseFloat(stock.changeWeek) - parseFloat(indexData.changeWeek),
    niftyRelativeChangeMonth:
      parseFloat(stock.changeMonth) - parseFloat(indexData.changeMonth),
    niftyRelativeChangeYear:
      parseFloat(stock.changeYear) - parseFloat(indexData.changeYear),
  };
};
const calculateSensexRelativeChange = (stock, indexData) => {
  return {
    sensexRelativeChange5min:
      parseFloat(stock.change5min) - parseFloat(indexData.change5min),
    sensexRelativeChange15min:
      parseFloat(stock.change15min) - parseFloat(indexData.change15min),
    sensexRelativeChange30min:
      parseFloat(stock.change30min) - parseFloat(indexData.change30min),
    sensexRelativeChangeHour:
      parseFloat(stock.changeHour) - parseFloat(indexData.changeHour),
    sensexRelativeChangeDay:
      parseFloat(stock.changeDay) - parseFloat(indexData.changeDay),
    sensexRelativeChangeWeek:
      parseFloat(stock.changeWeek) - parseFloat(indexData.changeWeek),
    sensexRelativeChangeMonth:
      parseFloat(stock.changeMonth) - parseFloat(indexData.changeMonth),
    sensexRelativeChangeYear:
      parseFloat(stock.changeYear) - parseFloat(indexData.changeYear),
  };
};
// Helper function for calculating percentage change
const calculatePercentageChange = (data, latestPrice, interval) => {
  if (
    !data ||
    !data.data ||
    !data.data.candles ||
    data.data.candles.length === 0
  ) {
    return null;
  }

  let startPrice;
  switch (interval) {
    case 5:
    case 15:
    case 30:
    case 60:
      startPrice = findStartPrice(data.data.candles, interval);
      break;
    default:
      startPrice = data;
      break;
  }

  if (!startPrice) return null;
  const percentageChange = ((latestPrice - startPrice) / startPrice) * 100;
  return parseFloat(percentageChange.toFixed(2));
};
const calculateDhanPercentageChange = (data, latestPrice, interval) => {
  if (!data) {
    return null;
  }

  let startPrice;
  switch (interval) {
    case 5:
    case 15:
    case 30:
    case 60:
      startPrice = findDhanStartPrice(data, interval);
      break;
    default:
      startPrice = data;
      break;
  }

  if (!startPrice) return null;
  const percentageChange = ((latestPrice - startPrice) / startPrice) * 100;
  return parseFloat(percentageChange.toFixed(2));
};
const findDhanStartPrice = (data, minutesAgo) => {
  // Convert the last timestamp (current time) from UNIX format to a Date object
  const currentTime = new Date(
    data.start_Time[data.start_Time.length - 1] * 1000
  );

  // Loop through the timestamp array
  for (let i = data.start_Time.length - 1; i >= 0; i--) {
    const candleTime = new Date(data.start_Time[i] * 1000);
    const minutesDifference = (currentTime - candleTime) / (1000 * 60);

    // If the time difference is greater than or equal to the requested minutesAgo, return the close price
    if (minutesDifference >= minutesAgo) {
      return data.close[i];
    }
  }

  return null; // Return null if no matching timestamp is found
};

const getStartPrice = (data) => {
  if (
    !data ||
    !data.data ||
    !data.data.candles ||
    data.data.candles.length === 0
  ) {
    return null;
  }

  let startPrice = data.data.candles[data.data.candles.length - 1][4];

  if (!startPrice) return null;
  return startPrice;
};
const getDhanClosePrice = (data) => {
  if (!data || !data.close || data.close.length === 0) {
    return null;
  }

  let startPrice = data?.close[data?.close?.length - 1];

  if (!startPrice) return null;
  return startPrice;
};

const findStartPrice = (candles, minutesAgo) => {
  const currentTime = new Date(candles[0][0]);
  for (const candle of candles) {
    const candleTime = new Date(candle[0]);
    const minutesDifference = (currentTime - candleTime) / (1000 * 60);
    if (minutesDifference >= minutesAgo) {
      return candle[4];
    }
  }
  return null;
};
const searchStocksByName = async (req, res) => {
  try {
    const searchTerm = req.params.search;
    if (!searchTerm) {
      return res.status(400).json({
        message: "Search term is required.",
        success: false,
      });
    }
    const stocks = await stockService.searchStocksByName(searchTerm);
    if (stocks.length === 0) {
      return res.status(404).json({
        message: "No matching stocks found.",
        success: false,
      });
    }
    const niftyData = await stockService.getStocksByIndex("nifty_index");
    const sensexData = await stockService.getStocksByIndex("sensex_index");
    const calculatedStocks = stocks.map((stock) => {
      const niftyRelativeChange = calculateNiftyRelativeChange(
        stock,
        niftyData[0]
      );
      const sensexRelativeChange = calculateSensexRelativeChange(
        stock,
        sensexData[0]
      );
      return {
        ...stock,
        ...niftyRelativeChange,
        ...sensexRelativeChange,
      };
    });
    return res.status(200).json({
      data: calculatedStocks,
      message: "Stocks fetched successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error searching stocks:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  updateStockData,
  getStocksByIndex,
  updatRemainingStocks,
  updateWeeklyStockData,
  updateMonthlyStockData,
  updateYearlyStockData,
  updateDailyData,
  updateDailyHistoricalData,
  searchStocksByName,
};
