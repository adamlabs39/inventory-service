import express from "express";
import DatamasterIngredientController from "../controllers/datamaster-ingredient-controller.js";
import DatamasterSupplierController from "../controllers/datamaster-supplier-controller.js";
import PengadaanBarangController from "../controllers/pengadaan-barang-controller.js";

const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v1";
const baseUrl = `/${apiBase}/${apiVersion}/inventory`;

const routes = express.Router();

// DATAMASTER - SUPPLIER
routes.post(
  `${baseUrl}/datamaster/supplier`,
  DatamasterSupplierController.create
);

routes.get(
  `${baseUrl}/datamaster/supplier`,
  DatamasterSupplierController.getAll
);

routes.get(
  `${baseUrl}/datamaster/supplier/aktif`,
  DatamasterSupplierController.getAllWithoutPagination
);
routes.put(
  `${baseUrl}/datamaster/supplier/:uuid`,
  DatamasterSupplierController.update
);
routes.delete(
  `${baseUrl}/datamaster/supplier/:uuid`,
  DatamasterSupplierController.delete
);

// INVENTORY - PENGADAAN - BARANG

routes.post(
  `${baseUrl}/pengadaan/pembelian-barang`,
  PengadaanBarangController.create
);

routes.get(
  `${baseUrl}/pengadaan/pembelian-barang`,
  PengadaanBarangController.getAll
);
routes.put(
  `${baseUrl}/pengadaan/pembelian-barang/:uuid`,
  PengadaanBarangController.update
);
routes.put(
  `${baseUrl}/pengadaan/pembelian-barang-batal/:uuid`,
  PengadaanBarangController.cancelPembelianBarang
);
routes.delete(
  `${baseUrl}/pengadaan/pembelian-barang/:uuid`,
  PengadaanBarangController.delete
);

export default routes;
