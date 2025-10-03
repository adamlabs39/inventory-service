import express from "express";
import KartuStokController from "../controllers/kartu-stok-controller.js";
import RiwayatMutasiController from "../controllers/riwayat-mutasi-controller.js";

const kartuStokMutasiRoutes = express.Router();

// KARTU STOK
kartuStokMutasiRoutes.get(
    `/kartu-stok`, 
    KartuStokController.getAll
);

// RIWAYAT MUTASI
kartuStokMutasiRoutes.get(
    `/mutasi`, 
    RiwayatMutasiController.getAll
);
kartuStokMutasiRoutes.post(
    `/mutasi`, RiwayatMutasiController.create
);

export default kartuStokMutasiRoutes;