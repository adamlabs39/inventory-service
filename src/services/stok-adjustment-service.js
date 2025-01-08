import KartuStokService from "./kartu-stok-service.js";
import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import StokAdjustmentValidation from "../validations/stok-adjustment-validation.js";
import BadRequestException from "../errors/bad-request-exception.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";

export default class StokAdjustmentService {
    static async getAll(req) {
        return await KartuStokService.getAll(req);
    }

    static async getDetail(req) {
        ZodValidator.validate(StokAdjustmentValidation.GET_DETAIL, req);
        const data = await ItemMedisJenisStokRepository.getDetailForStokAdjustment(req);

        if (!data) {
            throw new BadRequestException("Data not found");
        } else {
            return data.dataValues.stocks.map((item) => {
                return {
                    exp_date: item.exp_date,
                    sisa_stok: item.sisa_stok,
                    uuid: item.uuid,
                    nama: data.item_medis?.name,
                    kategori: "Medis",
                    jenis_stok: data.detail_stok?.name,
                    jenis_item: data.item_medis?.jenis_item,
                    kategori_obat: data.item_medis?.kategori_obat?.name,

                }
            });
        }
    }

    static async update(req) {
        ZodValidator.validate(StokAdjustmentValidation.UPDATE, req);

        req.exp_date = new Date(req.exp_date);

        return await StockMedisRepository.update(req);
    }
}