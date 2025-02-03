import {StokOpnameItemModel} from "@adameds/model-sdk/inventory";
import Pagination from "../helpers/pagination.js";
import {Op} from "sequelize";

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

    static async getPaginationByStokOpname(req) {
        const option = {
            where: {
                stok_opname_uuid: req.stok_opname_uuid,
                [Op.or]: [
                    {nama: {[Op.iLike]: `%${req.search || ''}%`}},
                    {kode_item: {[Op.iLike]: `%${req.search || ''}%`}},
                ],
            },
            order: [['created_at', 'DESC']],
        }

        if (req.jenis_item) {
            option.where.jenis_item = req.jenis_item;
        }

        return await Pagination.init(StokOpnameItemModel, req, option);
    }
}