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
            "stok_medis_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
            "stok_fisik": 10,
        }]

        await StokOpnameItemModel.bulkCreate(items, {transaction});
    }
}