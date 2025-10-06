import express from "express";
import PengadaanBarangController from "../controllers/pengadaan-barang-controller.js";
import VerifikasiBarangController from "../controllers/verifikasi-barang-controller.js";
import PenerimaanBarangController from "../controllers/penerimaan-barang-controller.js";
import ReturPengembalianController from "../controllers/retur-pengembalian-controller.js";

const pengadaanBarangRoutes = express.Router();

// Route untuk membuat pembelian barang baru
pengadaanBarangRoutes.post(
    `/pembelian-barang`,
    PengadaanBarangController.create
);

// Route untuk mendapatkan semua data pembelian barang
pengadaanBarangRoutes.get(
    `/pembelian-barang`,
    PengadaanBarangController.getAll
);

// Route untuk mendapatkan detail pembelian barang berdasarkan UUID
pengadaanBarangRoutes.get(
    `/pembelian-barang/:uuid`,
    PengadaanBarangController.getDetail
);

// Route untuk memperbarui data pembelian barang berdasarkan UUID
pengadaanBarangRoutes.put(
    `/pembelian-barang/:uuid`,
    PengadaanBarangController.update
);

// Route untuk membatalkan pembelian barang berdasarkan UUID
pengadaanBarangRoutes.put(
    `/pembelian-barang-batal/:uuid`,
    PengadaanBarangController.cancelPembelianBarang
);

// Route untuk verifikasi pembelian barang berdasarkan UUID
pengadaanBarangRoutes.put(
    `/verifikasi-barang/:uuid`,
    VerifikasiBarangController.verifikasiPembelianBarang
);

// Route untuk mendapatkan semua data retur supplier
pengadaanBarangRoutes.get(
    `/retur-supplier`, 
    ReturPengembalianController.getAll
);

// Route untuk mendapatkan daftar faktur yang tersedia untuk retur
pengadaanBarangRoutes.get(
    `/retur-supplier/available-faktur`, 
    ReturPengembalianController.getAvailableFaktur
);

// Route untuk mendapatkan faktur tertentu berdasarkan UUID
pengadaanBarangRoutes.get(
    `/retur-supplier/available-faktur/:uuid`, 
    ReturPengembalianController.getFaktur
);

// Route untuk mendapatkan detail retur supplier berdasarkan UUID
pengadaanBarangRoutes.get(
    `/retur-supplier/:uuid`, ReturPengembalianController.getByUuid
);

// Route untuk membuat retur supplier baru
pengadaanBarangRoutes.post(
    `/retur-supplier`, ReturPengembalianController.create
);

// Route untuk menyetujui penggantian barang retur supplier berdasarkan UUID
pengadaanBarangRoutes.put(
    `/retur-supplier/:uuid`, 
    ReturPengembalianController.acceptReplacement
);

export default pengadaanBarangRoutes;