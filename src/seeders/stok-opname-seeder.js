import {
    StokOpnameItemModel, StokOpnameModel
} from "@adameds/model-sdk/inventory";
import {toEpochDate} from "../helpers/date-helper.js";

export default class StokOpnameSeeder {
    static async seed(transaction) {
        const stokOpname = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "no_stok_opname": "SO-2021-0001",
                "tanggal_cut_off": toEpochDate(Date.now()),
                "judul_stok_opname": "Stok Opname Pertama",
                "jenis_stoks": [{
                    "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                    "name": "bpjs",
                }],
                "kategori_item": "medis",
                "jenis_items": ["obat", "alkes"],
                "petugas_so": "admin",
                "status": "draft",
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "no_stok_opname": "SO-2021-0002",
                "tanggal_cut_off": toEpochDate(Date.now()),
                "judul_stok_opname": "Stok Opname Pertama",
                "jenis_stoks": [{
                    "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                    "name": "bpjs",
                }],
                "kategori_item": "medis",
                "jenis_items": ["obat", "alkes"],
                "petugas_so": "admin",
                "status": "final",
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
        ];

        await StokOpnameModel.bulkCreate(stokOpname, {transaction});

        const items = [{
            "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "stok_opname_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "nama": "paracetamol",
            "kode_item": "prcm",
            "kategori": "obat",
            "jenis_item": "obat",
            "jenis_stok": "BPJS",
            "satuan": "pcs",
            "stok_awal": 10,
            "stok_masuk": 10,
            "stok_keluar": 5,
            "stok_sistem": 5,
            "stok_fisik": 4,
            "ed": "2025-12-12",
            "harga_satuan": 1000,
            "harga_akhir": 5000,
            "id_stok": "0192b31f-365d-731c-8b16-3a4565c9475e"
        }]

        await StokOpnameItemModel.bulkCreate(items, {transaction});
    }
}