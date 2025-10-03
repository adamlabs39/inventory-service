import express from "express";
import StokOpnameController from "../controllers/stok-opname-controller.js";

const stokOpnameRoutes = express.Router();

stokOpnameRoutes.get(`/`, StokOpnameController.getAll);
stokOpnameRoutes.post(`/`, StokOpnameController.create);

stokOpnameRoutes.get(`/kartu-stok`, StokOpnameController.getStockCard);
stokOpnameRoutes.post(`/import`, StokOpnameController.importStockCard);
stokOpnameRoutes.post(`/delete-items`, StokOpnameController.deleteItems);

stokOpnameRoutes.get(`/:stok_opname_uuid`, StokOpnameController.getDetail);

export default stokOpnameRoutes;