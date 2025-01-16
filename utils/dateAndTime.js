const moment = require("moment-timezone");

const getLastTradingDayOfPreviousYear = (date) => {
  let lastTradingDay = new Date(Date.UTC(date.getUTCFullYear() - 1, 11, 31)); // December 31 of the previous year
  const day = lastTradingDay.getUTCDay();

  if (day === 0) {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 2);
  } else if (day === 6) {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 1);
  }

  // Convert to IST (UTC + 5:30)
  lastTradingDay.setUTCMinutes(lastTradingDay.getUTCMinutes() + 330);

  return lastTradingDay.toISOString().split("T")[0];
};

const getLastTradingDayOfPreviousWeek = (date) => {
  let lastTradingDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 7); // Move to the same day of the previous week

  // Adjust to the last trading day (Friday)
  const day = lastTradingDay.getUTCDay();
  if (day === 0) {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 2);
  } else if (day === 6) {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 1);
  } else {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - (day - 5));
  }

  // Convert to IST (UTC + 5:30)
  lastTradingDay.setUTCMinutes(lastTradingDay.getUTCMinutes() + 330);

  return lastTradingDay.toISOString().split("T")[0];
};

const getLastTradingDayOfPreviousMonth = (date) => {
  let lastTradingDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0)
  ); // Last day of the previous month

  // Adjust to the last trading day (Friday)
  const day = lastTradingDay.getUTCDay();
  if (day === 0) {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 2);
  } else if (day === 6) {
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 1);
  }

  // Convert to IST (UTC + 5:30)
  lastTradingDay.setUTCMinutes(lastTradingDay.getUTCMinutes() + 330);

  return lastTradingDay.toISOString().split("T")[0];
};

const checkTradingHours = (now) => {
  const day = now.getUTCDay();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const currentMinutesUTC = hours * 60 + minutes;

  // Trading hours in UTC (3:45 AM - 12:45 PM)
  const tradingStartUTC = 3 * 60 + 45;
  const tradingEndUTC = 12 * 60 + 45;

  // List of specific holidays in YYYY-MM-DD format
  const holidays = [
    "2024-08-15", // Independence Day
    "2024-10-02", // Mahatma Gandhi Jayanti
    "2024-11-01", // Diwali Laxmi Pujan
    "2024-11-15", // Gurunanak Jayanti
    "2024-12-25", // Christmas
  ];

  const today = now.toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format

  return (
    day >= 1 && // Monday to Friday
    day <= 5 &&
    currentMinutesUTC >= tradingStartUTC &&
    currentMinutesUTC <= tradingEndUTC &&
    !holidays.includes(today) // Check if today is not a holiday
  );
};
const getLastTradingDay = (date) => {
  // Convert the given date to IST
  const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  let lastTradingDay = new Date(date.getTime() + istOffset);
  const day = lastTradingDay.getUTCDay();
  if (day === 0) {
    // Sunday
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 2);
  } else if (day === 6) {
    // Saturday
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 1);
  } else if (day === 1) {
    // Monday before trading hours (3:00 AM UTC is 8:30 AM IST)
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 3);
  } else {
    // Regular previous day
    lastTradingDay.setUTCDate(lastTradingDay.getUTCDate() - 1);
  }

  return lastTradingDay.toISOString().split("T")[0];
};

const getFormattedDate = (date) => {
  let formattedDate = new Date(date);
  formattedDate.setUTCDate(formattedDate.getUTCDate());

  return formattedDate?.toISOString().split("T")[0];
};

const getISTTime = () => {
  return moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};

const formatToISTTime = (isoString) => {
  return moment.tz(isoString, "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};

const getISTDate = () => {
  const dateInIST = moment.tz("Asia/Kolkata");
  return dateInIST.format("YYYY-MM-DD");
};
// Helper function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().split("T")[0];
};
module.exports = {
  getFormattedDate,
  getLastTradingDay,
  checkTradingHours,
  getLastTradingDayOfPreviousWeek,
  getLastTradingDayOfPreviousMonth,
  getLastTradingDayOfPreviousYear,
  getISTTime,
  formatToISTTime,
  getISTDate,
  addDays,
};
