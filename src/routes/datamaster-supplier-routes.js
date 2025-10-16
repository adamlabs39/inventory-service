import express from "express";
import DatamasterSupplierController from "../controllers/datamaster-supplier-controller.js";

const supplierRoutes = express.Router();

// Route untuk mendapatkan semua supplier aktif
supplierRoutes.get(
    "/aktif",
    DatamasterSupplierController.getAllWithoutPagination
);

// Route untuk mendapatkan detail supplier berdasarkan UUID
supplierRoutes.get(
    "/:uuid",
    DatamasterSupplierController.getByUuid
);

// Route untuk mendapatkan semua supplier (dengan pagination)
supplierRoutes.get(
    "/",
    DatamasterSupplierController.getAll
);

// Route untuk menambahkan supplier baru
supplierRoutes.post(
    "/",
    DatamasterSupplierController.create
);

// Route untuk memperbarui data supplier berdasarkan UUID
supplierRoutes.put(
    "/:uuid",
    DatamasterSupplierController.update
);

// Route untuk menghapus supplier berdasarkan UUID
supplierRoutes.delete(
    "/:uuid",
    DatamasterSupplierController.delete
);

export default supplierRoutes;