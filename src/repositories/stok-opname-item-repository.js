import {StokOpnameItemModel} from "@adameds/model-sdk/inventory";

export default class StokOpnameItemRepository {
    static async destroyByStokOpname(stok_opname_uuid, transaction) {
        return await StokOpnameItemModel.destroy({
            where: {
                stok_opname_uuid: stok_opname_uuid
            },
            transaction: transaction
        });
    }

    static async bulkCreate(items, transaction) {
        return await StokOpnameItemModel.bulkCreate(items, {transaction: transaction});
    }

    static async getByStokOpname(stok_opname_uuid) {
        return await StokOpnameItemModel.findAll({
            where: {
                stok_opname_uuid: stok_opname_uuid
            }
        });
    }

    static async deleteSome(uuids) {
        return await StokOpnameItemModel.destroy({
            where: {
                uuid: uuids
            }
        });
    }
}