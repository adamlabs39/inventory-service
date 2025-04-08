import {
    ReturSupplierItemModel,
    ReturSupplierModel,
} from "@adameds/model-sdk/inventory";
import {toEpochDate} from "../helpers/date-helper.js";

export default class ReturSupplierSeeder {
    static async seed(transaction) {
        const retur = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "no_retur_supplier": "RSUD-RETUR-0001",
                "tanggal_retur": toEpochDate(new Date()),
                "alasan_retur": 1,
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "pembelian_supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "status": "retur",
                "petugas_retur": "John Doe",
                "petugas_retur_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_penggantian": "uang",
                "supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
        ];

        await ReturSupplierModel.bulkCreate(retur, {transaction});

        const items = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "retur_supplier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "item_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty_retur": 1,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item": "medis",
                "harga_satuan": 100000,
                "exp_date": new Date("12-12-2030"),
                "item_type": "retur",
            }
        ]

        await ReturSupplierItemModel.bulkCreate(items, {transaction});
    }
}