import successResponse from "../responses/success-response.js";
import DatamasterSupplierService from "../services/datamaster-supplier-service.js";

export default class DatamasterSupplierController {
    static async create(req, res, nextFunction) {
        try {
            const payload = { ...req.body, faskes_uuid: req.author.faskesUuid };
            const result = await DatamasterSupplierService.create(payload);
            res.status(201).json(successResponse("Data berhasil disimpan", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getByUuid(req, res, nextFunction) {
        try {
            const { uuid } = req.params;
            const faskes_uuid = req.author.faskesUuid;
            const result = await DatamasterSupplierService.getByUuid({ uuid, faskes_uuid});
            res.status(200).json(successResponse("Data berhasil didapat", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAll(req, res, nextFunction) {
        try {
            const { name, page, limit } = req.query;
            const faskes_uuid = req.author.faskesUuid;
            const options = { name, page, limit, faskes_uuid };
            const result = await DatamasterSupplierService.getAll(options);
            res.status(200).json(successResponse(
                "data berhasil didapat",
                result.data,
                result.pagination
                )
            );
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAllWithoutPagination(req, res, nextFunction) {
        try {
            const { name } = req.query;
            const faskes_uuid = req.author.faskesUuid;
            const options = { name, faskes_uuid };
            const result = await DatamasterSupplierService.getAllWithoutPagination(options);
            res.status(200).json(successResponse("Data berhasil didapat", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async update(req, res, nextFunction) {
        try {
            const { uuid } = req.params;
            const body = req.body;
            const faskes_uuid = req.author.faskesUuid;
            const payload = { ...body, uuid: uuid, faskes_uuid: faskes_uuid }
            const result = await DatamasterSupplierService.update(payload);
            res.status(200).json(successResponse("Data berhasil diupdate", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async delete(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            const faskes_uuid = req.author.faskesUuid;
            await DatamasterSupplierService.delete({
                uuid: uuid,
                faskes_uuid: faskes_uuid,
            });
            res.status(200).json(successResponse("Data berhasil dihapus"));
        } catch (error) {
            nextFunction(error);
        }
    }
}
