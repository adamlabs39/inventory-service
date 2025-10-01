import NotfoundException from "../errors/notfound-exception.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import DatamasterSupplierRepository from "../repositories/datamaster-supplier-repository.js";
import DatamasterSupplierValidation from "../validations/datamaster-supplier-validation.js";

export default class DatamasterSupplierService {
    static async create(payload) {
        const validatedData = await DatamasterSupplierValidation.CREATE_SUPPLIER.parseAsync(payload);
        const transaction = await sequelizeInstance.transaction();
        try {
            const dataSupplier = await DatamasterSupplierRepository.create(validatedData, transaction);

            if (validatedData.supllier_items && validatedData.supllier_items.length > 0) {
                const itemsToCreate = validatedData.supllier_items.map(item => ({
                    ...item,
                    supllier_uuid: dataSupplier.uuid,
                    faskes_uuid: validatedData.faskes_uuid,
                }));
                const createdItems = await DatamasterSupplierRepository.bulkCreateSupplierItem(itemsToCreate, transaction);
                dataSupplier.dataValues.supplier_items = createdItems;
            } else {
                dataSupplier.dataValues.supplier_items = [];
            }
            
            await transaction.commit();
            return dataSupplier;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getByUuid(payload) {
        const validatedPayload = await DatamasterSupplierValidation.GET_SUPLLIER_BY_UUID.parseAsync(payload);
        const result = await DatamasterSupplierRepository.getByUuid(validatedPayload);
        if (!result) {
            throw new NotfoundException("Data supplier tidak ditemukan");
        }
        return {
            uuid: result.uuid,
            code: result.code,
            name: result.name,
            alamat: result.alamat,
            no_tlp: result.no_tlp,
            status: result.status,
            provinsi: {
                code: result.province?.code ?? null,
                name: result.province?.name ?? null
            },
            kabupaten: {
                code: result.kabupaten?.code ?? null,
                name: result.kabupaten?.name ?? null
            },
            kecamatan: {
                code: result.kecamatan?.code ?? null,
                name: result.kecamatan?.name ?? null
            },
            kelurahan: {
                code: result.kelurahan?.code ?? null,
                name: result.kelurahan?.name ?? null
            },
            kategori_items: result.supplier_items?.map(item => item.kategori_item) ?? []
        };
    }

    static async getAll(options) {
        const validatedOptions = await DatamasterSupplierValidation.GET_ALL_SUPPLIER.parseAsync(options);
        const finalOptions = {
            ...validatedOptions,
            page: validatedOptions.page || 1,
            limit: validatedOptions.limit || 10,
        };
        return await DatamasterSupplierRepository.getAll(finalOptions);
    }

    static async getAllWithoutPagination(options) {
        const validatedOptions = await DatamasterSupplierValidation.GET_ALL_SUPPLIER_WITHOUT_PAGINATION.parseAsync(options);
        return await DatamasterSupplierRepository.getAllWithoutPagination(validatedOptions);
    }

    static async update(req) {
        const transaction = await sequelizeInstance.transaction();        
        try {
            const validatedData = await DatamasterSupplierValidation.UPDATE_SUPPLIER.parseAsync(req);
            await DatamasterSupplierRepository.update(validatedData, transaction);
            if (validatedData.supllier_items) {
                await DatamasterSupplierRepository.deleteAllSupplierItem(validatedData.uuid, transaction);
                if (validatedData.supllier_items.length > 0) {
                    const newItems = validatedData.supllier_items.map((item) => ({
                        ...item,
                        supllier_items: validatedData.uuid,
                        faskes_uuid: validatedData.faskes_uuid
                    }))
                    await DatamasterSupplierRepository.bulkCreateSupplierItem(newItems, transaction);
                }
            }
            await transaction.commit();
            return await DatamasterSupplierRepository.getByUuid({
                uuid: validatedData.uuid,
                faskes_uuid: validatedData.faskes_uuid,
            });
        } catch (error) {
            await transaction.rollback();
            throw error
        }
    }

    static async delete(payload) {
        const validatedData = await DatamasterSupplierValidation.DELETE_SUPPLIER.parseAsync(payload);
        return await DatamasterSupplierRepository.delete(validatedData);
    }
}
