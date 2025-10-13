import Pagination from "../helpers/pagination.js";
import { Op } from "sequelize";
import { toEpochDate } from "../helpers/date-helper.js";
import {
    KabupatenModel,
    KecamatanModel,
    KelurahanModel,
    ProvinceModel,
} from "@adameds/model-sdk/datamaster";
import {
    MasterSupplierModel,
    MasterSupplierKategoriItemModel,
} from "@adameds/model-sdk/inventory";

const supplierDetailIncludes = [
    { model: ProvinceModel, as: "province", required: false, attributes: ["code", "name"] },
    { model: KabupatenModel, as: "kabupaten", required: false, attributes: ["code", "name"] },
    { model: KecamatanModel, as: "kecamatan", required: false, attributes: ["code", "name"] },
    { model: KelurahanModel, as: "kelurahan", required: false, attributes: ["code", "name"] },
    { model: MasterSupplierKategoriItemModel, as: "supplier_items", required: false, attributes: ["kategori_item"] }
];

export default class DatamasterSupplierRepository {
    static async create(payload, transaction) {
        return await MasterSupplierModel.create(payload, {transaction});
    }

    static async createSupplierItem(payload, transaction) {
        return await MasterSupplierKategoriItemModel.create(payload, {transaction});
    }

    static async bulkCreateSupplierItem(payload, transaction) {
        return await MasterSupplierKategoriItemModel.bulkCreate(payload, {transaction});
    }

    static async deleteAllSupplierItem(payload, transaction) {
        return await MasterSupplierKategoriItemModel.destroy({
            where: {
                supllier_uuid: payload,
            },
            transaction,
        });
    }

    static async getAll(options) {
        const whereClause = {
            faskes_uuid: options.faskes_uuid,
            deleted_at: { [Op.is]: null },
        }

        if (options.name) {
            whereClause.name = { [Op.iLike]: `%${options.name}%` };
        }

        const queryOptions = {
            where: whereClause,
            include: supplierDetailIncludes,
        };

        return Pagination.init(MasterSupplierModel, options, queryOptions);
    }

    static async getAllWithoutPagination(options) {
        const whereClause = {
            faskes_uuid: options.faskes_uuid,
            status: true,
        }

        if (options.name) {
            whereClause.name = { [Op.iLike]: `%${options.name}%` };
        }

        return await MasterSupplierModel.findAll({
            where: whereClause,
        });
    }

    static async getByUuid({ uuid, faskes_uuid }) {
        return await MasterSupplierModel.findOne({
            where: { uuid, faskes_uuid, deleted_at: null },
            include: supplierDetailIncludes,
        });
    }

    static async getCode(code) {
        return await MasterSupplierModel.findOne({
            where: {
                code: code,
                deleted_at: {
                    [Op.is]: null,
                },
            },
            attributes: ["code"],
        });
    }

    static async update(payload, transaction) {
        const { uuid, faskes_uuid,  ...dataToUpdate} = payload;
        return await MasterSupplierModel.update(dataToUpdate, {
            where: {
                uuid: uuid,
                faskes_uuid: faskes_uuid
            },
            transaction
        });
    }

    static async delete(payload) {
        return await MasterSupplierModel.update(
            { 
                deleted_at: toEpochDate(new Date())
            },
            { 
                where: { 
                    uuid: payload.uuid, 
                    faskes_uuid: payload.faskes_uuid 
                }
            }
        );
    }
}
