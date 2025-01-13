import {ItemMedisModel} from "@adameds/model-sdk/farmasi";

export default class ItemMedisRepository {
    static async getByCodes(codes) {
        return await ItemMedisModel.findAll({
            where: {
                code: codes
            },
            attributes: ['code'],
        })
    }
}