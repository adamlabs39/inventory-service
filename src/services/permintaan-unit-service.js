import ZodValidator from "../validations/zod-validator.js";
import InventoryValidation from "../validations/inventory-validation.js";
import PermintaanUnitValidation from "../validations/permintaan-unit-validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit-repository.js";

export default class PermintaanUnitService {
    static async getAll(req) {
        ZodValidator.validate(PermintaanUnitValidation.GET_ALL, req);

        const result = await PermintaanUnitRepository.getAll(req);

        if (result) {
            const data = [];
            result.data.forEach((item) => {
                item["lokasi_stok_tujuan"] = item.lokasi_stok_tujuan.name;
                data.push(item);
            });

            result.data = data;

            return result;
        } else {
            return []
        }
    }
}