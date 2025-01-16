const axios = require("axios");
const {
  getLastTradingDay,
  getLastTradingDayOfPreviousYear,
  getLastTradingDayOfPreviousMonth,
  getLastTradingDayOfPreviousWeek,
  getFormattedDate,
} = require("../utils/dateAndTime");

const fetchIntradayData = async (instrumentKey, type) => {
  const url = `https://api.upstox.com/v2/historical-candle/intraday/${type}|${instrumentKey}/1minute`;
  const dayResponse = await axios.get(url);
  const dayData = await dayResponse.data;

  return dayData;
};

const fetchHistoricalData = async (instrumentKey, type) => {
  const { lastDayUrl, weeklyUrl, monthlyUrl, yearlyUrl } = getApiUrls(
    instrumentKey,
    type
  );
  const [
    lastTradingSesionResponse,
    weeklyResponse,
    monthlyResponse,
    yearlyResponse,
  ] = await Promise.all([
    axios.get(lastDayUrl),
    axios.get(weeklyUrl),
    axios.get(monthlyUrl),
    axios.get(yearlyUrl),
  ]);
  let data = {};
  data.dayData = await lastTradingSesionResponse.data;
  data.weekData = await weeklyResponse.data;
  data.monthData = await monthlyResponse.data;
  data.yearData = await yearlyResponse.data;
  return data;
};

const getApiUrls = (instrumentKey, type) => {
  const now = new Date();
  const lastTradingDay = getLastTradingDay(now);
  const lastTradingDayOfPreviousYear = getLastTradingDayOfPreviousYear(now);
  const lastTradingDayOfPreviousMonth = getLastTradingDayOfPreviousMonth(now);
  const lastTradingDayOfPreviousWeek = getLastTradingDayOfPreviousWeek(now);
  return {
    lastDayUrl: `https://api.upstox.com/v2/historical-candle/${type}|${instrumentKey}/day/${lastTradingDay}/${lastTradingDay}`,
    weeklyUrl: `https://api.upstox.com/v2/historical-candle/${type}|${instrumentKey}/day/${getFormattedDate(
      lastTradingDayOfPreviousWeek
    )}/${getFormattedDate(lastTradingDayOfPreviousWeek)}`,
    monthlyUrl: `https://api.upstox.com/v2/historical-candle/${type}|${instrumentKey}/day/${getFormattedDate(
      lastTradingDayOfPreviousMonth
    )}/${getFormattedDate(lastTradingDayOfPreviousMonth)}`,
    yearlyUrl: `https://api.upstox.com/v2/historical-candle/${type}|${instrumentKey}/day/${getFormattedDate(
      lastTradingDayOfPreviousYear
    )}/${getFormattedDate(lastTradingDayOfPreviousYear)}`,
  };
};

module.exports = {
  fetchIntradayData,
  fetchHistoricalData,
};
