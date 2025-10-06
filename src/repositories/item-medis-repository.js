import {ItemMedisModel} from "@adameds/model-sdk/farmasi";

export default class ItemMedisRepository {
    static async getByCodes(codes) {
        return await ItemMedisModel.findAll({
            where: {
                code: codes
            },
            attributes: ['code', 'uuid'],
        })
    }

    static async getByUuid({ uuid }) {
        return await ItemMedisModel.findOne({
            where: {
                uuid: uuid
            }
        });
    }
}