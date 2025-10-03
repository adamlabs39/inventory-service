import express from "express";
import RiwayatTarifController from "../controllers/riwayat-tarif-controller.js";

const riwayatTarifRoutes = express.Router();

riwayatTarifRoutes.get(`/`, RiwayatTarifController.getAll);
riwayatTarifRoutes.get(`/:uuid`, RiwayatTarifController.getByUuid);

export default riwayatTarifRoutes;