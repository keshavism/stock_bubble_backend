const axios = require("axios");
var dc = require("dhanhq");
const {
  getLastTradingDay,
  getLastTradingDayOfPreviousYear,
  getLastTradingDayOfPreviousMonth,
  getLastTradingDayOfPreviousWeek,
  getFormattedDate,
  addDays,
} = require("../utils/dateAndTime");
const config = require("../config/config");
const ACCESS_TOKEN = config.ACCESS_TOKEN;
const DHAN_CLIENT_ID = "1100373491";

const client = new dc.DhanHqClient({
  accessToken: ACCESS_TOKEN,
  env: "PROD",
});

const fetchHistoricalData = async (symbol, type, instrument) => {
  const now = new Date();

  const lastTradingDay = getLastTradingDay(now); // Daily

  try {
    let dailyRequest = {
      symbol: symbol,
      exchangeSegment: type,
      instrument: instrument,
      expiryCode: 0,
      fromDate: getFormattedDate(lastTradingDay), // Yesterday
      toDate: getFormattedDate(now), // Today
    };
    const dailyData = await client.getDailyHistoricalData(dailyRequest);

    let data = {};
    data.dayData = dailyData;

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
const fetchYearlyData = async (symbol, type, instrument) => {
  const now = new Date();

  const lastTradingDayOfPreviousYear = getLastTradingDayOfPreviousYear(now); // Yearly

  try {
    // Define requests for four different timeframes

    // Yearly data
    let yearlyRequest = {
      symbol: symbol,
      exchangeSegment: type,
      instrument: instrument,
      expiryCode: 0,
      fromDate: getFormattedDate(lastTradingDayOfPreviousYear), // Last year's trading day
      toDate: addDays(lastTradingDayOfPreviousYear, 1), // The next day
    };

    const yearlyData = await client.getDailyHistoricalData(yearlyRequest);
    console.log(yearlyData);
    let data = {};

    data.yearData = yearlyData;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const fetchWeeklyData = async (symbol, type, instrument) => {
  const now = new Date();

  const lastTradingDayOfPreviousWeek = getLastTradingDayOfPreviousWeek(now); // Weekly

  try {
    // Weekly data
    let weeklyRequest = {
      symbol: symbol,
      exchangeSegment: type,
      instrument: instrument,
      expiryCode: 0,
      fromDate: getFormattedDate(lastTradingDayOfPreviousWeek), // Last week's trading day
      toDate: addDays(lastTradingDayOfPreviousWeek, 1), // The next day
    };

    const weeklyData = await client.getDailyHistoricalData(weeklyRequest);
    console.log(weeklyData);
    let data = {};

    data.weekData = weeklyData;

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
const fetchMonthlyData = async (symbol, type, instrument) => {
  const now = new Date();

  const lastTradingDayOfPreviousMonth = getLastTradingDayOfPreviousMonth(now); // Monthly

  try {
    // Monthly data
    let monthlyRequest = {
      symbol: symbol,
      exchangeSegment: type,
      instrument: instrument,
      expiryCode: 0,
      fromDate: getFormattedDate(lastTradingDayOfPreviousMonth), // Last month's trading day
      toDate: addDays(lastTradingDayOfPreviousMonth, 1), // The next day
    };

    const monthlyData = await client.getDailyHistoricalData(monthlyRequest);
    console.log(monthlyData);
    let data = {};

    data.monthData = monthlyData;

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const fetchIntradayData = async (securityId, type, instrument) => {
  try {
    let IntradayHistoricalDataRequest = {
      securityId: securityId,
      exchangeSegment: type,
      instrument: instrument,
    };

    const data = await client.getIntradayHistoricalData(
      IntradayHistoricalDataRequest
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
module.exports = {
  fetchIntradayData,
  fetchHistoricalData,
  fetchWeeklyData,
  fetchMonthlyData,
  fetchYearlyData,
};
