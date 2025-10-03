import express from "express";
import PermintaanUnitController from "../controllers/permintaan-unit-controller.js";
import PengeluaranUnitController from "../controllers/pengeluaran-unit-controller.js";

const pengeluaranBarangRoutes = express.Router();

pengeluaranBarangRoutes.get(
    `/pengiriman-unit`, 
    PermintaanUnitController.getAll
);
pengeluaranBarangRoutes.get(
    `/pengiriman-unit/:uuid`, 
    PermintaanUnitController.getDetail
);
pengeluaranBarangRoutes.put(
    `/pengiriman-unit/batal/:uuid`, 
    PermintaanUnitController.tolakPermintaan
);
pengeluaranBarangRoutes.put(
    `/pengiriman-unit/verifikasi/:uuid`, 
    PermintaanUnitController.verifikasiPermintaan
);
pengeluaranBarangRoutes.put(
    `/pengiriman-unit/kirim/:uuid`, 
    PermintaanUnitController.kirimPermintaan
);
pengeluaranBarangRoutes.get(
    `/pengeluaran-unit/available-stock`, 
    PengeluaranUnitController.getAvailableItems
);
pengeluaranBarangRoutes.post(
    `/pengeluaran-unit`, 
    PengeluaranUnitController.create
);
pengeluaranBarangRoutes.get(
    `/pengeluaran-unit`, 
    PengeluaranUnitController.getAll
);
pengeluaranBarangRoutes.get(
    `/pengeluaran-unit/:uuid`, 
    PengeluaranUnitController.getDetail
);

export default pengeluaranBarangRoutes;