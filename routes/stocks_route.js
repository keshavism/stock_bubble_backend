const express = require("express");
const router = express.Router();
const stocksController = require("../controllers/stocks_controller");

router.get("/search/:search", stocksController.searchStocksByName);
router.post("/", stocksController.updateStockData);
router.get("/:indexName", stocksController.getStocksByIndex);
module.exports = router;
