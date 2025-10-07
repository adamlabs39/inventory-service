import express from "express";
import StockController from "../controllers/stock-controller.js";

const stockRoutes = express.Router();

stockRoutes.get(
    '/',
    StockController.getAvailableStock,
)

export default stockRoutes;