import {KonfigurasiHargaModel} from "@adameds/model-sdk/farmasi";

export default class KonfigurasiHargaRepository {
    static async get(faskes_uuid) {
        return await KonfigurasiHargaModel.findOne({
            where: {
                faskes_uuid: faskes_uuid,
                deleted_at: null,
            },
        });
    }
}