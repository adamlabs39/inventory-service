import {
    RiwayatMutasiModel
} from "@adameds/model-sdk/inventory";

export default class RiwayatMutasiSeeder {
    static async seed(transaction) {
        const riwayat = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "item_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "code": "PRM.123456",
                "exp_date": Date.now(),
                "lokasi_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "jenis_stok_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "sumber_mutasi": "pelayanan",
                "stok_awal": 10,
                "stok_mutasi": 5,
                "petugas": "admin",
                "type": "defisit",
                "keterangan": {
                    description: "Penjualan obat",
                },
            },
        ];

        await RiwayatMutasiModel.bulkCreate(riwayat, {transaction});
    }
}