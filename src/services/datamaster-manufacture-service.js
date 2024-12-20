import ZodValidator from "../validations/zod-validator.js";
import DatamasterValidation from "../validations/datamaster-validation.js";
import DataMasterManufactureRepository from "../repositories/datamaster-manufacture-repository.js";

export default class DatamasterManufactureService {
    static async create(req) {
        let validData = ZodValidator.validate(DatamasterValidation.CREATE_MANUFACTURE, req);
        return await DataMasterManufactureRepository.create(validData);
    }

    static async getAll(req) {
        ZodValidator.validate(DatamasterValidation.GET_ALL_SATUAN, req);
        return await DataMasterManufactureRepository.getAll(req);
    }

    static update(req) {
        let validData = ZodValidator.validate(DatamasterValidation.UPDATE_MANUFACTURE, req);
        return DataMasterManufactureRepository.update(validData);
    }

    static delete(req) {
        let validData = ZodValidator.validate(DatamasterValidation.DELETE_SATUAN, req);
        return DataMasterManufactureRepository.delete(validData);
    }
}