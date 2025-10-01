import express from "express";
import PenerimaanBarangController from "../controllers/penerimaan-barang-controller.js";
import PenerimaanReturController from "../controllers/penerimaan-retur-controller.js";

const penerimaanBarangRoutes = express.Router();

penerimaanBarangRoutes.put(
    '/pembelian/:uuid', 
    PenerimaanBarangController.createPenerimaan
);

penerimaanBarangRoutes.get(
    '/retur-unit', 
    PenerimaanReturController.getAll
);
penerimaanBarangRoutes.get(
    '/retur-unit/:uuid', 
    PenerimaanReturController.getDetail
);

export default penerimaanBarangRoutes;