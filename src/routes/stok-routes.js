import express from "express";
import StockController from "../controllers/stock-controller.js";

// Version api untuk management stok yg lebih fleksibel

const stockRoutes = express.Router();

stockRoutes.get(
    '/',
    StockController.getAvailableStock,
)

stockRoutes.post(
    '/reduce',
    StockController.reduceStock,
)

stockRoutes.post(
    '/increase',
    StockController.increaseStock,
)

export default stockRoutes;