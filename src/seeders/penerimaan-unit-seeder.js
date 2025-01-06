
import {PermintaanUnitItemModel, PermintaanUnitModel} from "@adameds/model-sdk/inventory";
import {toEpochDate} from "../helpers/date-helper.js";

export default class PenerimaanUnitSeeder {
    static async seed(transaction) {
        const permintaan = [
            {
                "faskes_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "no_permintaan" : "INV/2021/01/0001",
                "tanggal_permintaan" : toEpochDate(new Date()),
                "kategori_item" : "medis",
                "jenis_stok" : "obat",
                "jenis_item" : "obat",
                "lokasi_stok_tujuan_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "lokasi_stok_awal_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "catatan" : "Permintaan obat",
                "cito" : false,
                "total_item" : 10,
                "status" : "request",
                "petugas_permintaan" : "admin",
                "petugas_permintaan_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_stok_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
        ];

        await PermintaanUnitModel.bulkCreate(permintaan, { transaction });

        const items = [
            {
                "faskes_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "permintaan_unit_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "item_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_permintaan" : 10,
                "konversi_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item" : "medis",
                "stok_awal_lokasi_penerima" : 10,
            },
            {
                "faskes_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "permintaan_unit_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "item_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_permintaan" : 10,
                "konversi_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item" : "medis",
                "stok_awal_lokasi_penerima" : 10,
            },
            {
                "faskes_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475t",
                "permintaan_unit_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "item_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_permintaan" : 10,
                "konversi_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item" : "medis",
                "stok_awal_lokasi_penerima" : 10,
            }
        ]

        await PermintaanUnitItemModel.bulkCreate(items, { transaction });
    }
}