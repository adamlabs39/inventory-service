import express from "express";
import DatamasterSupplierController from "../controllers/datamaster-supplier-controller.js";

const supplierRoutes = express.Router();

supplierRoutes.get(
    `/aktif`,
    DatamasterSupplierController.getAllWithoutPagination
);
supplierRoutes.get(
    `/:uuid`,
    DatamasterSupplierController.getByUuid
);
supplierRoutes.get(
    `/`,
    DatamasterSupplierController.getAll
);
supplierRoutes.post(
    `/`,
    DatamasterSupplierController.create
);
supplierRoutes.put(
    `/:uuid`,
    DatamasterSupplierController.update
);
supplierRoutes.delete(
    `/:uuid`,
    DatamasterSupplierController.delete
);

export default supplierRoutes;