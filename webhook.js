const WebSocket = require("ws");
const { TextEncoder, TextDecoder } = require("util");
const config = require("./config/config");

// Replace these with actual credentials
const API_ACCESS_TOKEN = config.ACCESS_TOKEN;
const CLIENT_ID = "1100373491";

// Function to convert a string to a byte array
function stringToByteArray(str, size) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const padded = new Uint8Array(size).fill(0);
  padded.set(encoded);
  return padded;
}

// Function to build the authorization packet
function buildAuthorizationPacket(apiAccessToken, clientId) {
  const packet = new Uint8Array(585);

  // Add Header (83 bytes)
  const header = new Uint8Array(83);
  header[0] = 11; // Feed Request Code for connect
  header.set(new Uint8Array([0, 83]), 1); // Message Length of 83 bytes
  header.set(stringToByteArray(clientId, 30), 3); // Client ID
  header.fill(0, 33, 83); // Dhan Auth filled with zeros
  packet.set(header, 0);

  // Add API Access Token (500 bytes)
  packet.set(stringToByteArray(apiAccessToken, 500), 83);

  // Add Authentication Type (2 bytes) set to 2P
  packet[583] = 0x00;
  packet[584] = 0x02;

  return packet;
}

// Function to build the subscription packet
function buildSubscriptionPacket(clientId, instruments) {
  const packet = new Uint8Array(2187);

  // Add Header (83 bytes)
  const header = new Uint8Array(83);
  header[0] = 11; // Feed Request Code for connect
  header.set(new Uint8Array([0, 2187]), 1); // Message Length of full packet
  header.set(stringToByteArray(clientId, 30), 3); // Client ID
  header.fill(0, 33, 83); // Dhan Auth filled with zeros
  packet.set(header, 0);

  // Number of Instruments (4 bytes)
  const numInstruments = instruments.length;
  const instrumentBytes = new Uint8Array(
    new Uint32Array([numInstruments]).buffer
  );
  packet.set(instrumentBytes, 83);

  // Instrument Data (each instrument is 21 bytes)
  instruments.forEach((instrument, index) => {
    const instrumentPacket = new Uint8Array(21);
    instrumentPacket[0] = instrument.exchangeSegment;
    instrumentPacket.set(stringToByteArray(instrument.securityId, 20), 1);
    packet.set(instrumentPacket, 87 + index * 21);
  });
  return packet;
}

// Function to handle incoming messages
// Function to handle and parse incoming messages
function handleIncomingMessage(data) {
  console.log(data);
  const buffer = new Uint8Array(data);

  // First 8 bytes are response header
  const responseCode = buffer[0]; // Response Feed Code
  const messageLength = (buffer[1] << 8) | buffer[2]; // 2 bytes for message length
  const exchangeSegment = buffer[3]; // Exchange segment
  const securityId =
    (buffer[4] << 24) | (buffer[5] << 16) | (buffer[6] << 8) | buffer[7]; // Security ID

  console.log(
    `Received response - Code: ${responseCode}, Length: ${messageLength}, Exchange: ${exchangeSegment}, Security ID: ${securityId}`
  );

  // Check for Ticker Packet (Feed Response Code = 2)
  if (responseCode === 2) {
    // Parse Ticker Data (LTP and LTT)
    const ltpBuffer = buffer.slice(8, 12); // Last Traded Price (float32, 4 bytes)
    const lttBuffer = buffer.slice(12, 16); // Last Trade Time (int32, 4 bytes)

    // Decode the float32 for LTP
    const ltp = new DataView(ltpBuffer.buffer).getFloat32(0, false); // Big-endian
    // Decode the int32 for LTT
    const ltt = new DataView(lttBuffer.buffer).getInt32(0, false); // Big-endian

    // Log the parsed data
    console.log(
      `Ticker Data - Last Traded Price: ${ltp}, Last Trade Time: ${ltt}`
    );
  } else if (responseCode === 6) {
    // Handle Previous Close Packet (Feed Response Code = 6)
    const prevClose = new DataView(buffer.slice(8, 12).buffer).getInt32(
      0,
      false
    );
    const openInterest = new DataView(buffer.slice(12, 16).buffer).getInt32(
      0,
      false
    );
    console.log(`Previous Close: ${prevClose}, Open Interest: ${openInterest}`);
  }
}

// WebSocket connection
const ws = new WebSocket("wss://api-feed.dhan.co", {
  perMessageDeflate: false,
});

ws.on("open", () => {
  console.log("WebSocket connection opened.");

  // Send Authorization Packet
  const authPacket = buildAuthorizationPacket(API_ACCESS_TOKEN, CLIENT_ID);
  ws.send(authPacket);

  // Subscribe to instruments
  const instruments = {
    RequestCode: 15,
    InstrumentCount: 2,
    InstrumentList: [
      {
        ExchangeSegment: "NSE_EQ",
        SecurityId: "1333",
      },
      {
        ExchangeSegment: "BSE_EQ",
        SecurityId: "532540",
      },
    ],
  };

  const subscriptionPacket = buildSubscriptionPacket(CLIENT_ID, instruments);
  ws.send(subscriptionPacket);
});

ws.on("message", handleIncomingMessage);

ws.on("ping", () => {
  console.log("Ping received from server, sending Pong.");
  ws.pong();
});

ws.on("close", (code, reason) => {
  console.log(
    `WebSocket connection closed with code: ${code}, reason: ${reason}`
  );
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});
