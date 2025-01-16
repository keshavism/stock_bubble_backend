const WebSocket = require("ws");
const { Buffer } = require("buffer");
const config = require("./config/config");

const token = config.ACCESS_TOKEN;
const clientId = "1100373491";

// WebSocket URL
const wsUrl = `wss://api-feed.dhan.co?version=2&token=${token}&clientId=${clientId}&authType=2`;

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

function handleTickerPacket(buffer) {
  // Ensure buffer length is at least 17 bytes (since we're reading up to byte 16)
  if (buffer.length < 16) {
    console.error(
      `Invalid Ticker Packet size. Expected at least 17 bytes, but received ${buffer.length}.`
    );
    return;
  }
  // Log raw buffer data for debugging
  console.log(`Raw Buffer Data (Ticker Packet):`, buffer);

  // Try reading the last traded price and time
  try {
    const lastTradedPrice = buffer.readFloatBE(10); // Last Traded Price (bytes 9-12)

    console.log(`\nTicker Packet:`);
    console.log(`Last Traded Price: ₹${lastTradedPrice.toFixed(2)}`);
  } catch (error) {
    console.error("Error processing Ticker Packet:", error);
  }
}

function handleQuotePacket(buffer) {
  // Ensure buffer length is at least 51 bytes (since we're reading up to byte 50)
  if (buffer.length < 50) {
    console.error(
      `Invalid Quote Packet size. Expected at least 51 bytes, but received ${buffer.length}.`
    );
    return;
  }
  console.log(`Raw Buffer Data (Quote Packet):`, buffer);

  // Try reading the quote packet fields
  try {
    const lastTradedPrice = buffer.readFloatBE(10); // Latest Traded Price (bytes 9-12)
    const volume = buffer.readUInt32BE(24); // Volume (bytes 23-26)
    const dayOpenValue = buffer.readFloatBE(36); // Day Open Value (bytes 35-38)
    const dayHighValue = buffer.readFloatBE(40); // Day High Value (bytes 43-46)
    const dayLowValue = buffer.readFloatBE(44); // Day Low Value (bytes 47-50)

    console.log(`\nQuote Packet:`);
    console.log(`Last Traded Price: ₹${lastTradedPrice.toFixed(2)}`);
    console.log(`Volume: ${volume}`);
    console.log(`Day Open Value: ₹${dayOpenValue.toFixed(2)}`);
    console.log(`Day High Value: ₹${dayHighValue.toFixed(2)}`);
    console.log(`Day Low Value: ₹${dayLowValue.toFixed(2)}`);
  } catch (error) {
    console.error("Error processing Quote Packet:", error);
  }
}

// WebSocket connection open handler
ws.on("open", () => {
  console.log("WebSocket connection established.");

  // Subscribe to instruments (example)
  const subscribeMessage = {
    RequestCode: 17,
    InstrumentCount: 1,
    InstrumentList: [
      {
        ExchangeSegment: "NSE_EQ",
        SecurityId: "3045", // Replace with valid NSE Security ID
      },
    ],
  };

  ws.send(JSON.stringify(subscribeMessage));
  console.log("Subscription request sent:", subscribeMessage);
});

// WebSocket message handler
ws.on("message", (data) => {
  const buffer = Buffer.from(data);

  // Parse the response based on the header
  const responseCode = buffer.readUInt8(0); // First byte gives the Feed Response Code
  console.log(responseCode);
  if (responseCode === 2) {
    // Ticker Packet (Feed Response Code 2)
    handleTickerPacket(buffer);
  } else if (responseCode === 4) {
    // Quote Packet (Feed Response Code 4)
    handleQuotePacket(buffer);
  } else if (responseCode === 6) {
    console.log("Previous Close Packet received");
    // Handle previous close packet (response code 6)
  }
});

// Ping-Pong handler to keep the connection alive
ws.on("ping", () => {
  ws.pong();
  console.log("Pong sent to keep connection alive.");
});

// WebSocket error handler
ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

// WebSocket close handler
ws.on("close", () => {
  console.log("WebSocket connection closed.");
});

const fetchDhanHistoricalData = async (securityId, fromDate, toDate) => {
  const url = "https://api.dhan.co/charts/historical";
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "access-token": config.ACCESS_TOKEN, // Replace with actual token
  };

  const body = {
    securityId: securityId,
    exchangeSegment: "NSE_EQ", // Assuming NSE Equity
    instrument: "EQUITY", // Assuming INDEX, update as necessary
    expiryCode: -2147483648, // Same as in the example provided
    fromDate: fromDate,
    toDate: toDate,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Dhan historical data:", error);
    throw error;
  }
};
console.log(lastTradingDay);
const dayData = await fetchDhanHistoricalData(
  securityId,
  lastTradingDay,
  lastTradingDay
);
console.log(dayData);
