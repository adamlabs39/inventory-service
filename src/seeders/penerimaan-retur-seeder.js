import {
    ReturUnitItemModel,
    ReturUnitModel,
    RiwatatMutasiModel, StokOpnameItemModel, StokOpnameModel
} from "@adameds/model-sdk/inventory";
import {toEpochDate} from "../helpers/date-helper.js";

export default class PenerimaanReturSeeder {
    static async seed(transaction) {
        const retur = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "no_retur": "RETUR-001",
                "tanggal_retur": toEpochDate(Date.now()),
                "jenis_stok": "obat",
                "kategori_item": "medis",
                "jenis_item": "obat",
                "alasan_retur": "rusak",
                "petugas_retur": "admin",
                "lokasi_stok_awal_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "lokasi_stok_tujuan_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "total_item": 10,
                "total_harga": 100000,
                "catatan": "retur obat rusak",
                "petugas_retur_uuid": "0192b31f-365d-8b16-3a4565c9475e",
            },
        ];

        await ReturUnitModel.bulkCreate(retur, {transaction});

        const items = [{
            "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "retur_unit_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "kategori_item": "medis",
            "item_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "qty": 10,
            "qty_terima": 10,
            "harga_satuan": 10000,
            "exp_date": "2025-12-12",
            "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "stok_awal_lokasi_pengirim": 10,
            "stok_awal_lokasi_penerima": 100
        }]

        await ReturUnitItemModel.bulkCreate(items, {transaction});
    }
}