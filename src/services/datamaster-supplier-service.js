import ZodValidator from "../validations/zod-validator.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import DatamasterValidation from "../validations/datamaster-validation.js";
import DatamasterSupplierRepository from "../repositories/datamaster-supplier-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";

export default class DatamasterSupplierService {
    static async create(req) {
        const transaction = await sequelizeInstance.transaction();

        const validatedData = await DatamasterValidation.CREATE_SUPPLIER.parseAsync(
            req
        );

        const dataSupplier = await DatamasterSupplierRepository.create(
            validatedData,
            transaction
        );

        const dataSupplierUuid = dataSupplier.dataValues.uuid;
        dataSupplier.dataValues.supplier_items = [];

        // create supplier item
        try {
            for (const supplier_item of req.supplier_items) {
                supplier_item.supllier_uuid = dataSupplierUuid;
                // item.faskes_uuid = req.faskes_uuid;
                supplier_item.faskes_uuid = "0192b31f-365d-731c-8b16-3a4565c9475e";

                // ZodValidator.validate(AlkesValidation.CREATE_ALKES_ITEM, item);

                const data_suppplier_item =
                    await DatamasterSupplierRepository.createSupplierItem(
                        supplier_item,
                        transaction
                    );
                dataSupplier.dataValues.supplier_items.push(data_suppplier_item);
            }
        } catch (error) {
            await transaction.rollback();
            throw new BadRequestException("iki error");
        }
        // return await DatamasterSupplierRepository.create(validatedData);
        await transaction.commit();

        return dataSupplier;
    }

    static async getAll(req) {
        ZodValidator.validate(DatamasterValidation.GET_ALL_SATUAN, req);
        return await DatamasterSupplierRepository.getAll(req);
    }

    static async getAllWithoutPagination(req) {
        return await DatamasterSupplierRepository.getAllWithoutPagination(req);
    }

    static async update(req) {
        let validData = ZodValidator.validate(
            DatamasterValidation.UPDATE_SUPPLIER,
            req
        );

        const transaction = await sequelizeInstance.transaction();

        try {
            await DatamasterSupplierRepository.update(validData, transaction);
            await DatamasterSupplierRepository.deleteAllSupplierItem(validData.uuid, transaction);
            await DatamasterSupplierRepository.bulkCreateSupplierItem(validData.supplier_items.map((item) => {
                item.supllier_uuid = validData.uuid;
                item.faskes_uuid = validData.faskes_uuid;
                return item;
            }), transaction);

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw new BadRequestException("gagal update supplier",);
        }
    }

    static delete(req) {
        let validData = ZodValidator.validate(
            DatamasterValidation.DELETE_SATUAN,
            req
        );
        return DatamasterSupplierRepository.delete(validData);
    }
}
