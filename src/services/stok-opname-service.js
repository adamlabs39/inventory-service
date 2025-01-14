import ZodValidator from "../validations/zod-validator.js";
import StokOpnameValidation from "../validations/stok-opname-validation.js";
import StokOpnameRepository from "../repositories/stok-opname-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";
import ItemMedisRepository from "../repositories/item-medis-repository.js";
import ExcelMapper from "../helpers/excel-mapper.js";

export default class StokOpnameService {
    static async getAll(req) {
        ZodValidator.validate(StokOpnameValidation.GET_ALL, req);

        return await StokOpnameRepository.getAll(req);
    }

    static async getDetail(req) {

    }

    static async getStockCard(req) {
        ZodValidator.validate(StokOpnameValidation.GET_STOCK_CARD, req);

        return await StokOpnameRepository.getStockCard(req);
    }

    static async create(req) {

    }

    static async saveExistingStock(req) {

    }

    static async saveInitialStock(req) {

    }

    static async importStockCard(req) {
        const stokOpname = ExcelMapper.mapStokOpname(req.data);

        const code = stokOpname.items.map(item => item.code);

        const result = await ItemMedisRepository.getByCodes(code);

        code.forEach(
            item => {
                if (!result.find(itemMedis => itemMedis.code === item)) {
                    throw new BadRequestException(`Item dengan kode ${item} tidak ditemukan`);
                }
            }
        )

        return stokOpname;
    }
}