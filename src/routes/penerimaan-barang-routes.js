import express from "express";
import PenerimaanBarangController from "../controllers/penerimaan-barang-controller.js";
import PenerimaanReturController from "../controllers/penerimaan-retur-controller.js";

const penerimaanBarangRoutes = express.Router();

// Route untuk membuat penerimaan barang dari pembelian tertentu (by UUID)
penerimaanBarangRoutes.put(
    "/pembelian/:uuid", 
    PenerimaanBarangController.createPenerimaan
);

// Route untuk menampilkan semua data retur unit
penerimaanBarangRoutes.get(
    "/retur-unit", 
    PenerimaanReturController.getAll
);

// Route untuk menampilkan detail retur unit berdasarkan UUID
penerimaanBarangRoutes.get(
    "/retur-unit/:uuid", 
    PenerimaanReturController.getDetail
);

export default penerimaanBarangRoutes;