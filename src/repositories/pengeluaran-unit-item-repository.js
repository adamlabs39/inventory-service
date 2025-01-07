import {PengeluaranUnitItemModel} from "@adameds/model-sdk/inventory";

export default class PengeluaranUnitItemRepository {
    static async bulkCreate(req, transaction){
            return await PengeluaranUnitItemModel.bulkCreate(req, {transaction});
    }
}