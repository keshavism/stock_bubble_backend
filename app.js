const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler.middleware");
const cron = require("node-cron");
const http = require("http");
const { Server } = require("socket.io");
const router = require("./router/router,js");
const {
  updateStockData,
  updatRemainingStocks,
  updateDailyHistoricalData,
  updateDailyData,
} = require("./controllers/stocks_controller");
const stocks_service = require("./services/stocks_service");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// Router
app.use(router);
// Making public folder accessible
app.use("/public", express.static("public"));

// Error Handling Middleware
app.use(errorHandler);

// 404 Error Handling
app.use((req, res, next) => {
  res.status(404).json({ message: "Route Not Found" });
});

const ISTTimeZone = "Asia/Kolkata";

const indexNames = [
  // "nifty_2",

  "nifty_1_100",
  "nifty_101_200",
  "nifty_201_300",
  "nifty_301_400",
  "nifty_401_500",
  "nifty_501_600",
  "nifty_601_700",
  "nifty_701_800",
  "nifty_801_900",
  "nifty_901_1000",
  "nifty_midcap_150",
  "nifty_smallcap_250",
  "nifty_microcap_250",
  "nifty_500",
  "sector_index",
  "nifty_index",
  "sensex_index",
];
const holidays = [
  "2024-08-15", // Independence Day
  "2024-10-02", // Mahatma Gandhi Jayanti
  "2024-11-01", // Diwali Laxmi Pujan
  "2024-11-15", // Gurunanak Jayanti
  "2024-12-25", // Christmas
];

const isHoliday = (date) => {
  const today = moment(date).tz(ISTTimeZone).format("YYYY-MM-DD");
  return holidays.includes(today);
};

indexNames.forEach((indexName, i) => {
  const startMinute = (31 + i * 1) % 60; // Start at 3:35 PM and increment by 5 minutes
  const startHour = 15 + Math.floor((31 + i * 1) / 60); // Handle the hour transition between 3:35 PM and 4:35 PM

  const cronExpression = `${startMinute} ${startHour} * * 1-5`; // Runs on specific minute and hour from Monday to Friday

  const dailyStockUpdate = cron.schedule(
    cronExpression,
    // "*/1 * * * *", // for testing after every 5 mins
    async () => {
      console.log(`dailyStockUpdate Scheduler started for ${indexName}.`);
      // const now = new Date();
      // if (isHoliday(now)) {
      //   console.log(`Skipping ${indexName} update on a holiday: ${now}`);
      //   return;
      // }
      let type = "NSE_EQ",
        instrument = "EQUITY";
      if (indexName === "sector_index" || indexName === "nifty_index") {
        type = "NSE_INDEX";

        await updateStockData(indexName, type);
      } else if (indexName === "sensex_index") {
        type = "BSE_INDEX";
        await updateStockData(indexName, type);
      } else {
        await updateDailyData(indexName, type, instrument);
        // await updateStockData(indexName, type);
      }

      console.log(`done Scheduler started for ${indexName}.`);
    },
    {
      scheduled: true,
      timezone: ISTTimeZone,
    }
  );
  dailyStockUpdate.start();
});

const specificTimesCron = cron.schedule(
  "30 16,17,17 * * 1-5", // Runs at 4:30 PM, 5:00 PM, and 5:30 PM IST from Monday to Friday
  // "*/5 * * * *", // for testing after every 5 mins

  async () => {
    const now = new Date();
    // if (isHoliday(now)) {
    //   console.log(`Skipping specificTimesCron update on a holiday: ${now}`);
    //   return;
    // }

    console.log("specificTimesCron Scheduler started.");
    await updatRemainingStocks();
    console.log(`Update completed for specificTimesCron.`);
  },
  {
    scheduled: true,
    timezone: ISTTimeZone,
  }
);

specificTimesCron.start();
// Scheduler 1: Every Monday at 9:00 AM
cron.schedule("0 9 * * 1", async () => {
  console.log("Running task every Monday at 9:00 AM");
  // Add your task logic here
  await stocks_service.updateWeekPrices();
});

// Scheduler 2: Every 1st of the month at 8:50 AM
cron.schedule("50 8 1 * *", async () => {
  console.log("Running task on the 1st of every month at 8:50 AM");
  // Add your task logic here
  await stocks_service.updateMonthPrices();
});

// Scheduler 3: Only on 1st January at 9:10 AM
cron.schedule("10 9 1 1 *", async () => {
  console.log("Running task on 1st January at 9:10 AM");
  // Add your task logic here
  await stocks_service.updateYearPrices();
});
// Socket
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origins: ["http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected, socketId: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.set("io", io);

module.exports = { server, io };

// indexNames.forEach((indexName, i) => {
//   const startMinute = (27 + i * 1) % 60; // Start at 3:35 PM and increment by 5 minutes
//   const startHour = 11 + Math.floor((27 + i * 1) / 60); // Handle the hour transition between 3:35 PM and 4:35 PM

//   const cronExpression = `${startMinute} ${startHour} * * 1-5`; // Runs on specific minute and hour from Monday to Friday

//   const dailyStockUpdate = cron.schedule(
//     cronExpression,
//     // "*/1 * * * *", // for testing after every 5 mins
//     async () => {
//       console.log(`dailyStockUpdate Scheduler started for ${indexName}.`);
//       // const now = new Date();
//       // if (isHoliday(now)) {
//       //   console.log(`Skipping ${indexName} update on a holiday: ${now}`);
//       //   return;
//       // }
//       let type = "NSE_EQ",
//         instrument = "EQUITY";
//       if (indexName === "sector_index" || indexName === "nifty_index") {
//         type = "NSE_INDEX";
//       } else if (indexName === "sensex_index") {
//         type = "BSE_INDEX";
//       } else {
//         await updateDailyHistoricalData(indexName, type, instrument);
//         // await updateStockData(indexName, type);
//       }

//       console.log(`done Scheduler started for ${indexName}.`);
//     },
//     {
//       scheduled: true,
//       timezone: ISTTimeZone,
//     }
//   );
//   dailyStockUpdate.start();
// });
