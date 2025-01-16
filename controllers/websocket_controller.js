const WebSocket = require("ws");
const wss = new WebSocket.Server({ noServer: true }); // Create a WebSocket server

// Define WebSocket logic
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");

  ws.on("message", (message) => {
    console.log("Received: ", message);
    // You can handle different message types and send notifications to clients.
  });

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
  });
});

module.exports = wss;
