import express from "express";
import StokAdjustmentController from "../controllers/stok-adjustment-controller.js";

const stokAdjustmentRoutes = express.Router();

stokAdjustmentRoutes.get(`/`, StokAdjustmentController.getAll);
stokAdjustmentRoutes.put(`/`, StokAdjustmentController.update);
stokAdjustmentRoutes.get(`/:uuid`, StokAdjustmentController.getDetail);

export default stokAdjustmentRoutes;