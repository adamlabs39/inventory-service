import {PembelianBarangSupplierItemModel, PembelianBarangSupplierModel} from "@adameds/model-sdk/inventory";
import {toEpochDate} from "../helpers/date-helper.js";

export default class PengadaanBarangSeeder {
    static async seed(transaction) {
        const data = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "no_po": "PO-001",
                "kategori_item": "medis",
                "status": "pending",
                "jenis_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_item": "alkes",
                "supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "tanggal_pembelian": toEpochDate(Date.now()),
                "metode_pembelian": "tunai",
                "isCito": false,
                "total_item": 1,
                "grand_total": 100000,
                "petugas_pembuat_po": "John Doe",
                "petugas_pembuat_po_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "no_po": "PO-001",
                "kategori_item": "medis",
                "status": "verifikasi",
                "jenis_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_item": "alkes",
                "supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "tanggal_pembelian": toEpochDate(Date.now()),
                "metode_pembelian": "tunai",
                "isCito": false,
                "total_item": 1,
                "grand_total": 100000,
                "petugas_pembuat_po": "John Doe",
                "petugas_pembuat_po_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475t",
                "no_po": "PO-001",
                "kategori_item": "medis",
                "status": "diterima",
                "jenis_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_item": "alkes",
                "supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "tanggal_pembelian": toEpochDate(Date.now()),
                "metode_pembelian": "tunai",
                "isCito": false,
                "total_item": 1,
                "grand_total": 100000,
                "petugas_pembuat_po": "John Doe",
                "petugas_pembuat_po_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
        ];

        await PembelianBarangSupplierModel.bulkCreate(data, {transaction});

        const items = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "pembelian_barang_supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "item_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_order": 100,
                "qty_terima": 50,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item": "medis",
                "harga_satuan": 100000,
                "exp_date": new Date("12-12-2030"),
                "total_harga": 5000000,
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "pembelian_barang_supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "item_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_order": 100,
                "qty_terima": 50,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item": "medis",
                "harga_satuan": 100000,
                "exp_date": new Date("12-12-2030"),
                "total_harga": 5000000,
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475t",
                "pembelian_barang_supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475t",
                "item_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_order": 100,
                "qty_terima": 50,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item": "medis",
                "harga_satuan": 100000,
                "exp_date": new Date("12-12-2030"),
                "total_harga": 5000000,
            }
        ];

        await PembelianBarangSupplierItemModel.bulkCreate(items, {transaction});
    }
}