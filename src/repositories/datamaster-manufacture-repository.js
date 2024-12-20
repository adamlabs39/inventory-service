import Pagination from "../helpers/pagination.js";
import {Op} from "sequelize";
import {toEpochDate} from "../helpers/date-helper.js";
import {KabupatenModel, KecamatanModel, KelurahanModel, ProvinceModel} from "@adameds/model-sdk/datamaster";
import {ManufactureModel} from "@adameds/model-sdk/farmasi";

export default class DataMasterManufactureRepository {
    static async create(req) {
        return await ManufactureModel.create(req);
    }

    static async getAll(req) {
        const option = {
            where: {
                faskes_uuid : req.faskes_uuid,
                name : {[Op.iLike]: `%${req.name || ""}%`},
                deleted_at: {
                    [Op.is]: null,
                },
            },
            include: [
                {
                    model: ProvinceModel,
                    as: "province",
                    required: false,
                    attributes: [
                        "code", "name"
                    ]
                },
                {
                    model: KabupatenModel,
                    as: "kabupaten",
                    required: false,
                    attributes: [
                        "code", "name"
                    ]
                },
                {
                    model: KecamatanModel,
                    as: "kecamatan",
                    required: false,
                    attributes: [
                        "code", "name"
                    ]
                },
                {
                    model: KelurahanModel,
                    as: "kelurahan",
                    required: false,
                    attributes: [
                        "code", "name"
                    ]
                }
            ],
        };

        return Pagination.init(ManufactureModel, req, option);
    }

    static async update(req) {
        return await ManufactureModel.update(req, {
            where: {
                uuid: req.uuid,
            }
        });
    }

    static async delete(req) {
        return await ManufactureModel.update({
            deleted_at : toEpochDate(new Date())
        },{
            where: {
                uuid: req.uuid,
            }
        });
    }
}