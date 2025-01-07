import {
    PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel
} from "@adameds/model-sdk/inventory";
import {toEpochDate} from "../helpers/date-helper.js";

export default class PengeluaranUnitSeeder {
    static async seed(transaction) {
        const pengeluaran = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "no_pengeluaran": "INV/2021/01/0001",
                "jenis_pengeluaran": "pengeluaran tanpa permintaan",
                "tanggal_pengeluaran": toEpochDate(new Date()),
                "kategori_item": "medis",
                "jenis_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_item": "obat",
                "lokasi_stok_tujuan_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "lokasi_stok_awal_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "catatan": "pengeluaran obat",
                "total_harga": 100000,
                "total_item": 10,
                "status": "request",
                "petugas_pengeluaran": "admin",
                "petugas_pengeluaran_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            },
        ];

        await PengeluaranUnitModel.bulkCreate(pengeluaran, {transaction});

        const items = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "pengeluaran_unit_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "stock_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty": 10,
                "exp_date": toEpochDate(Date.now()),
                "harga_satuan": 14000,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "stok_awal_lokasi_pengirim": 20,
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "pengeluaran_unit_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "stock_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty": 10,
                "exp_date": toEpochDate(Date.now()),
                "harga_satuan": 14000,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "stok_awal_lokasi_pengirim": 20,
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475t",
                "pengeluaran_unit_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "stock_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "qty": 10,
                "exp_date": toEpochDate(Date.now()),
                "harga_satuan": 14000,
                "konversi_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "stok_awal_lokasi_pengirim": 20,
            }
        ]

        await PengeluaranUnitItemModel.bulkCreate(items, {transaction});
    }
}