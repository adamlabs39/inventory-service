import express from "express";
import DatamasterSupplierController from "../controllers/datamaster-supplier-controller.js";
import PengadaanBarangController from "../controllers/pengadaan-barang-controller.js";
import VerifikasiBarangController from "../controllers/verifikasi-barang-controller.js";
import PenerimaanBarangController from "../controllers/penerimaan-barang-controller.js";
import PermintaanUnitController from "../controllers/permintaan-unit-controller.js";
import PengeluaranUnitController from "../controllers/pengeluaran-unit-controller.js";
import KartuStokController from "../controllers/kartu-stok-controller.js";
import StokAdjustmentController from "../controllers/stok-adjustment-controller.js";
import RiwayatMutasiController from "../controllers/riwayat-mutasi-controller.js";
import StokOpnameController from "../controllers/stok-opname-controller.js";
import PenerimaanReturController from "../controllers/penerimaan-retur-controller.js";

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
routes.put(
    `${baseUrl}/pengadaan/verifikasi-barang/:uuid`,
    VerifikasiBarangController.verifikasiPembelianBarang
);
routes.put(
    `${baseUrl}/pengadaan/penerimaan-barang/:uuid`,
    PenerimaanBarangController.createPenerimaan
);

// PERMINTAAN BARANG UNIT
routes.get(`${baseUrl}/pengiriman-unit`, PermintaanUnitController.getAll);
routes.get(`${baseUrl}/pengiriman-unit/:uuid`, PermintaanUnitController.getDetail);
routes.put(`${baseUrl}/pengiriman-unit/batal/:uuid`, PermintaanUnitController.tolakPermintaan);
routes.put(`${baseUrl}/pengiriman-unit/verifikasi/:uuid`, PermintaanUnitController.verifikasiPermintaan);
routes.put(`${baseUrl}/pengiriman-unit/kirim/:uuid`, PermintaanUnitController.kirimPermintaan);

// PENGELUARAN UNIT
routes.get(`${baseUrl}/pengeluaran-unit/available-stock`, PengeluaranUnitController.getAvailableItems);
routes.post(`${baseUrl}/pengeluaran-unit`, PengeluaranUnitController.create);
routes.get(`${baseUrl}/pengeluaran-unit`, PengeluaranUnitController.getAll);
routes.get(`${baseUrl}/pengeluaran-unit/:uuid`, PengeluaranUnitController.getDetail);

// KARTU STOK & MUTASI
routes.get(`${baseUrl}/kartu-stok`, KartuStokController.getAll);
routes.get(`${baseUrl}/mutasi`, RiwayatMutasiController.getAll);

// STOK ADJUSTMENT
routes.get(`${baseUrl}/stok-adjustment`, StokAdjustmentController.getAll);
routes.get(`${baseUrl}/stok-adjustment/:uuid`, StokAdjustmentController.getDetail);
routes.put(`${baseUrl}/stok-adjustment`, StokAdjustmentController.update);

// STOK OPNAME
routes.get(`${baseUrl}/stok-opname`, StokOpnameController.getAll);
routes.get(`${baseUrl}/stok-opname/:uuid`, StokOpnameController.getDetail);
routes.get(`${baseUrl}/stok-opname/:uuid/kartu-stok`, StokOpnameController.getStockCard);
routes.post(`${baseUrl}/stok-opname`, StokOpnameController.create);
routes.post(`${baseUrl}/stok-opname/import`, StokOpnameController.importStockCard);

// PENERIMAAN RETUR
routes.get(`${baseUrl}/penerimaan-retur-unit`, PenerimaanReturController.getAll);
routes.get(`${baseUrl}/penerimaan-retur-unit/:uuid`, PenerimaanReturController.getDetail);

export default routes;
