import express from "express";
import StokAdjustmentController from "../controllers/stok-adjustment-controller.js";

const stokAdjustmentRoutes = express.Router();

// Route untuk mendapatkan semua data stok adjustment
stokAdjustmentRoutes.get(
    `/`, 
    StokAdjustmentController.getAll
);

// Route untuk memperbarui stok adjustment
stokAdjustmentRoutes.put(
    `/`, 
    StokAdjustmentController.update
);

// Route untuk mendapatkan detail stok adjustment berdasarkan UUID
stokAdjustmentRoutes.get(
    `/:uuid`, 
    StokAdjustmentController.getDetail
);

export default stokAdjustmentRoutes;