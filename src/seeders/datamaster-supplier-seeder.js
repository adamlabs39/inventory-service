import {
    MasterSupplierKategoriItemModel,
    MasterSupplierModel,
} from "@adameds/model-sdk/inventory";

export default class DatamasterSupplierSeeder {
    static async seed(transaction) {
        const suppliers = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "code": "SUP-001",
                "name": "Supplier 1",
                "no_tlp": "08123456789",
                "status": true,
                "kecamatan_code": "123456",
                "provinsi_code": "123456",
                "kabupaten_code": "123456",
                "kelurahan_code": "123456",
                "alamat": "Jl. Supplier 1",
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "code": "SUP-002",
                "name": "Supplier 2",
                "no_tlp": "08123456789",
                "status": true,
                "kecamatan_code": "123456",
                "provinsi_code": "123456",
                "kabupaten_code": "123456",
                "kelurahan_code": "123456",
                "alamat": "Jl. Supplier 2",
            },
        ];

        await MasterSupplierModel.bulkCreate(suppliers, {transaction});

        const supplierItems = [
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "supllier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item": "medis",
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "supllier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475r",
                "kategori_item": "non-medis",
            },
            {
                "faskes_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475t",
                "supllier_uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "kategori_item": "medis",
            }
        ]

        await MasterSupplierKategoriItemModel.bulkCreate(supplierItems, {transaction});
    }
}