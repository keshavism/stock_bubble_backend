const express = require("express");
const router = express.Router();
const stocksController = require("../controllers/stocks_controller");
const { adminAuthToken } = require("../middlewares/authenticateToken");

router.get(
  "/search/:search",
  adminAuthToken,
  stocksController.searchStocksByName
);
// router.get("/signin", stocksController.signin);
router.post("/", stocksController.updateStockData);
router.get("/:indexName", adminAuthToken, stocksController.getStocksByIndex);
module.exports = router;
