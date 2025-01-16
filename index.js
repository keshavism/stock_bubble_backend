const { server } = require("./app");
const config = require("./config/config");
const PORT = config.PORT;

// Start the server and listen on the defined port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
