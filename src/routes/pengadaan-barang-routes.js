import express from "express";
import PengadaanBarangController from "../controllers/pengadaan-barang-controller.js";
import VerifikasiBarangController from "../controllers/verifikasi-barang-controller.js";
import PenerimaanBarangController from "../controllers/penerimaan-barang-controller.js";
import ReturPengembalianController from "../controllers/retur-pengembalian-controller.js";

const pengadaanBarangRoutes = express.Router();

// Pembelian Barang
pengadaanBarangRoutes.post(
    `/pembelian-barang`,
    PengadaanBarangController.create
);
pengadaanBarangRoutes.get(
    `/pembelian-barang`,
    PengadaanBarangController.getAll
);
pengadaanBarangRoutes.get(
    `/pembelian-barang/:uuid`,
    PengadaanBarangController.getDetail
);
pengadaanBarangRoutes.put(
    `/pembelian-barang/:uuid`,
    PengadaanBarangController.update
);
pengadaanBarangRoutes.put(
    `/pembelian-barang-batal/:uuid`,
    PengadaanBarangController.cancelPembelianBarang
);
// Verifikasi Barang
pengadaanBarangRoutes.put(
    `/verifikasi-barang/:uuid`,
    VerifikasiBarangController.verifikasiPembelianBarang
);
// Penerimaan Barang
pengadaanBarangRoutes.put(
    `/penerimaan-barang/:uuid`,
    PenerimaanBarangController.createPenerimaan
);
pengadaanBarangRoutes.get(
    `/retur-supplier`, 
    ReturPengembalianController.getAll
);
pengadaanBarangRoutes.get(
    `/retur-supplier/available-faktur`, 
    ReturPengembalianController.getAvailableFaktur
);
pengadaanBarangRoutes.get(
    `/retur-supplier/available-faktur/:uuid`, 
    ReturPengembalianController.getFaktur
);
pengadaanBarangRoutes.get(
    `/retur-supplier/:uuid`, ReturPengembalianController.getByUuid
);
pengadaanBarangRoutes.post(
    `/retur-supplier`, ReturPengembalianController.create
);
pengadaanBarangRoutes.put(
    `/retur-supplier/:uuid`, 
    ReturPengembalianController.acceptReplacement
);

export default pengadaanBarangRoutes;