import Pagination from "../helpers/pagination.js";
import {Op} from "sequelize";
import {toEpochDate} from "../helpers/date-helper.js";
import {IngredientModel} from "@adameds/model-sdk/farmasi";

export default class DataMasterIngredientRepository {
    static async create(req) {
        return await IngredientModel.create({
            code: req.code,
            name: req.name,
            status: req.status,
        });
    }

    static async getAll(req) {
        const option = {
            where: {
                name : {[Op.iLike]: `%${req.name || ""}%`},
                deleted_at: {
                    [Op.is]: null,
                },
            },
        };

        return Pagination.init(IngredientModel, req, option);
    }

    static async update(req) {
        return await IngredientModel.update({
            code: req.code,
            name: req.name,
            status: req.status,
        }, {
            where: {
                uuid: req.uuid,
            }
        });
    }

    static async delete(req) {
        return await IngredientModel.update({
            deleted_at : toEpochDate(new Date())
        },{
            where: {
                uuid: req.uuid,
            }
        });
    }
}