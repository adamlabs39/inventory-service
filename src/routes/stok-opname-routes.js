import express from "express";
import StokOpnameController from "../controllers/stok-opname-controller.js";

const stokOpnameRoutes = express.Router();

// Route untuk mendapatkan semua data stok opname
stokOpnameRoutes.get(
    `/`, 
    StokOpnameController.getAll
);

// Route untuk membuat stok opname baru
stokOpnameRoutes.post(
    `/`, 
    StokOpnameController.create
);

// Route untuk mendapatkan kartu stok (stock card)
stokOpnameRoutes.get(
    `/kartu-stok`, 
    StokOpnameController.getStockCard
);

// Route untuk import data kartu stok
stokOpnameRoutes.post(
    `/import`, 
    StokOpnameController.importStockCard
);

// Route untuk menghapus item-item pada stok opname
stokOpnameRoutes.post(
    `/delete-items`, 
    StokOpnameController.deleteItems
);

// Route untuk mendapatkan detail stok opname berdasarkan UUID
stokOpnameRoutes.get(
    `/:stok_opname_uuid`, 
    StokOpnameController.getDetail
);

export default stokOpnameRoutes;