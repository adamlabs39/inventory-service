import {PermintaanUnitItemModel} from "@adameds/model-sdk/inventory";

export default class PermintaanUnitItemRepository {
    static async update(req, transaction) {
        return await PermintaanUnitItemModel.update(
            req,
            {
                where: {
                    uuid: req.uuid
                },
                transaction
            }
        );
    }

    static async create(req, transaction) {
        return await PermintaanUnitItemModel.create(
            req,
            {
                transaction
            }
        );
    }
}