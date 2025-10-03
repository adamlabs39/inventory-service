import PenerimaanReturRepository from "../repositories/penerimaan-retur-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import PenerimaanReturValidation from "../validations/penerimaan-validation.js";
import BadRequestException from "../errors/bad-request-exception.js";

export default class PenerimaanReturService {
    static async getAll(request) {
        ZodValidator.validate(PenerimaanReturValidation.GET_ALL, request);

        return await PenerimaanReturRepository.getAll(request);
    }

    static async getDetail(request) {
        ZodValidator.validate(PenerimaanReturValidation.GET_DETAIL, request);

        const response = await PenerimaanReturRepository.getDetail(request);

        if (!response) {
            throw new BadRequestException("Data tidak ditemukan");
        }

        response.items?.forEach((item) => {
            item.dataValues.qty = `${item.qty} ${item.item?.satuan_penggunaan?.name}`
            item.dataValues.qty_terima = `${item.qty_terima} ${item.item?.satuan_penggunaan?.name}`
            item.dataValues.name = item.item?.name;
            item.dataValues.item = undefined;
        })

        return response;
    }
}