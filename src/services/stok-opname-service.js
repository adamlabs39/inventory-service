import ZodValidator from "../validations/zod-validator.js";
import StokOpnameValidation from "../validations/stok-opname-validation.js";
import StokOpnameRepository from "../repositories/stok-opname-repository.js";

export default class StokOpnameService {
    static async getAll(req) {
        ZodValidator.validate(StokOpnameValidation.GET_ALL, req);

        return await StokOpnameRepository.getAll(req);
    }

    static async getDetail(req) {

    }

    static async getStockCard(req) {

    }

    static async create(req) {

    }

    static async saveExistingStock(req) {

    }

    static async saveInitialStock(req) {

    }
}