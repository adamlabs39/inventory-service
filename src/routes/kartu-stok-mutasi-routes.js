import express from "express";
import KartuStokController from "../controllers/kartu-stok-controller.js";
import RiwayatMutasiController from "../controllers/riwayat-mutasi-controller.js";

const kartuStokMutasiRoutes = express.Router();

// Route untuk menampilkan semua data kartu stok
kartuStokMutasiRoutes.get(
    `/kartu-stok`, 
    KartuStokController.getAll
);

// Route untuk menampilkan semua data riwayat mutasi
kartuStokMutasiRoutes.get(
    `/mutasi`, 
    RiwayatMutasiController.getAll
);

// Route untuk menambahkan riwayat mutasi baru
kartuStokMutasiRoutes.post(
    `/mutasi`, RiwayatMutasiController.create
);

export default kartuStokMutasiRoutes;