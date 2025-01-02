import {PermintaanUnitItemModel} from "@adameds/model-sdk/inventory";
import sequelizeInstance from "@adameds/model-sdk/instance";

export default class PermintaanUnitItemRepository {
    static async update(req, transaction) {
        if (!transaction) {
            transaction = await sequelizeInstance.transaction();
        }

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
        if (!transaction) {
            transaction = await sequelizeInstance.transaction();
        }

        return await PermintaanUnitItemModel.create(
            req,
            {
                transaction
            }
        );
    }
}