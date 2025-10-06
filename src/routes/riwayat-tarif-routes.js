import express from "express";
import RiwayatTarifController from "../controllers/riwayat-tarif-controller.js";

const riwayatTarifRoutes = express.Router();

// Route untuk mendapatkan semua data riwayat tarif
riwayatTarifRoutes.get(
    `/`, 
    RiwayatTarifController.getAll
);

// Route untuk mendapatkan detail riwayat tarif berdasarkan UUID
riwayatTarifRoutes.get(
    `/:uuid`, 
    RiwayatTarifController.getByUuid
);

export default riwayatTarifRoutes;