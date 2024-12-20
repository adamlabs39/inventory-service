import ZodValidator from "../validations/zod-validator.js";
import DatamasterValidation from "../validations/datamaster-validation.js";
import DataMasterIngredientRepository from "../repositories/datamaster-ingredient-repository.js";

export default class DatamasterIngredientService {
    static async create(req) {
        let validData = ZodValidator.validate(DatamasterValidation.CREATE_INGREDIENT, req);
        return await DataMasterIngredientRepository.create(validData);
    }

    static async getAll(req) {
        ZodValidator.validate(DatamasterValidation.GET_ALL_SATUAN, req);
        return await DataMasterIngredientRepository.getAll(req);
    }

    static update(req) {
        let validData = ZodValidator.validate(DatamasterValidation.UPDATE_SATUAN, req);
        return DataMasterIngredientRepository.update(validData);
    }

    static delete(req) {
        let validData = ZodValidator.validate(DatamasterValidation.DELETE_SATUAN, req);
        return DataMasterIngredientRepository.delete(validData);
    }
}