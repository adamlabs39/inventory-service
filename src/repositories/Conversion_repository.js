import {ConversionModel} from "@adameds/model-sdk/farmasi";

export default class ConversionRepository {
    static async getAll(req) {
        return await ConversionModel.findAll({
            where: {
                deleted_at: null,
                faskes_uuid: req.faskes_uuid,
                item_medis_uuid: req.item_medis_uuid
            },
            attributes: ["satuan_pembelian", "satuan_penggunaan", "konversi"]
        })
    }
}