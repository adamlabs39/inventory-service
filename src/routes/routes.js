import express from "express";
import pengadaanBarangRoutes from "./pengadaan-barang-routes.js";
import pengeluaranBarangRoutes from "./pengeluaran-barang-routes.js"; 
import penerimaanBarangRoutes from "./penerimaan-barang-routes.js";
import dataMasterSupplierRoutes from "./datamaster-supplier-routes.js";
import riwayatTarifRoutes from "./riwayat-tarif-routes.js";
import kartuStokMutasiRoutes from "./kartu-stok-mutasi-routes.js";
import stokOpnameRoutes from "./stok-opname-routes.js";
import stokAdjustmentRoutes from "./stok-adjustment-routes.js";
import stockRoutes from "./stok-routes.js";
import lokasiGudangRoutes from "./lokasi-gudang-routes.js";

const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v3";
const baseUrl = `/${apiBase}/${apiVersion}/inventory`;
const routes = express.Router();

// DATAMASTER - SUPPLIER
routes.use(`${baseUrl}/datamaster/supplier`, dataMasterSupplierRoutes);

// PENGADAAN - BARANG
routes.use(`${baseUrl}/pengadaan`, pengadaanBarangRoutes);

// PENERIMAAN - BARANG
routes.use(`${baseUrl}/penerimaan`, penerimaanBarangRoutes);

// PENGELUARAN - BARANG
routes.use(`${baseUrl}`, pengeluaranBarangRoutes);

// KARTU STOK & MUTASI
routes.use(`${baseUrl}`, kartuStokMutasiRoutes);

// STOK ADJUSTMENT
routes.use(`${baseUrl}/stok-adjustment`, stokAdjustmentRoutes);

// STOK OPNAME
routes.use(`${baseUrl}/stok-opname`, stokOpnameRoutes);

// RIWAYAT TARIF
routes.use(`${baseUrl}/riwayat-tarif`, riwayatTarifRoutes);

// STOK (VERSION UPGRADE)
routes.use(`${baseUrl}/stok`, stockRoutes);

// DATAMASTER
routes.use(`${baseUrl}/datamaster`, lokasiGudangRoutes);

export default routes;
