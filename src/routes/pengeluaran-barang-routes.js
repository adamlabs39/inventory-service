import express from "express";
import PermintaanUnitController from "../controllers/permintaan-unit-controller.js";
import PengeluaranUnitController from "../controllers/pengeluaran-unit-controller.js";

const pengeluaranBarangRoutes = express.Router();

// Route untuk mendapatkan semua permintaan pengiriman unit
pengeluaranBarangRoutes.get(
    `/pengiriman-unit`, 
    PermintaanUnitController.getAll
);

// Route untuk mendapatkan detail permintaan pengiriman unit berdasarkan UUID
pengeluaranBarangRoutes.get(
    `/pengiriman-unit/:uuid`, 
    PermintaanUnitController.getDetail
);

// Route untuk membatalkan permintaan pengiriman unit
pengeluaranBarangRoutes.put(
    `/pengiriman-unit/batal/:uuid`, 
    PermintaanUnitController.tolakPermintaan
);

// Route untuk verifikasi permintaan pengiriman unit
pengeluaranBarangRoutes.put(
    `/pengiriman-unit/verifikasi/:uuid`, 
    PermintaanUnitController.verifikasiPermintaan
);

// Route untuk mengirim permintaan pengiriman unit
pengeluaranBarangRoutes.put(
    `/pengiriman-unit/kirim/:uuid`, 
    PermintaanUnitController.kirimPermintaan
);

// Route untuk mendapatkan stok yang tersedia untuk pengeluaran unit
pengeluaranBarangRoutes.get(
    `/pengeluaran-unit/available-stock`, 
    PengeluaranUnitController.getAvailableItems
);

// Route untuk membuat pengeluaran unit baru
pengeluaranBarangRoutes.post(
    `/pengeluaran-unit`, 
    PengeluaranUnitController.create
);

// Route untuk mendapatkan semua data pengeluaran unit
pengeluaranBarangRoutes.get(
    `/pengeluaran-unit`, 
    PengeluaranUnitController.getAll
);

// Route untuk mendapatkan detail pengeluaran unit berdasarkan UUID
pengeluaranBarangRoutes.get(
    `/pengeluaran-unit/:uuid`, 
    PengeluaranUnitController.getDetail
);

export default pengeluaranBarangRoutes;