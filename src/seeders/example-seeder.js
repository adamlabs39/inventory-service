import {AturanPakaiModel} from "@adameds/model-sdk/farmasi";

export default class ExampleSeeder {
    static async seed(transaction) {
        const aturanPakai = [
            {
                "faskes_uuid" : "0192b31f-365d-731c-8b16-3a4565c9475e",
                "uuid": "0192b31f-365d-731c-8b16-3a4565c9475e",
                "code" : "3xsehari",
                "name" : "3x sehari",
                "status" : true,
                "periode_unit" : "hari",
                "periode" : 1,
                "frekuensi" : 3,
            },
        ];

        await AturanPakaiModel.bulkCreate(aturanPakai, { transaction });
    }
}