import successResponse from "../responses/success-response.js";
import DatamasterSupplierService from "../services/datamaster-supplier-service.js";

export default class DatamasterSupplierController {
    static async create(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;

            await DatamasterSupplierService.create(req.body);
            res.status(201).json(successResponse("data berhasil dibuat"));
        } catch (error) {
            console.log("errorsss", error);
            nextFunction(error);
        }
    }

    static async getAll(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.name = req.query.name;
            req.body.page = req.query.page;
            req.body.limit = req.query.limit;
            const result = await DatamasterSupplierService.getAll(req.body);
            res
                .status(200)
                .json(
                    successResponse(
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
            req.query.faskes_uuid = req.author.faskesUuid;
            const result = await DatamasterSupplierService.getAllWithoutPagination(
                req.body
            );
            res.status(200).json(successResponse("data berhasil didapat", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async update(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            req.body.uuid = uuid;
            await DatamasterSupplierService.update(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            console.log("error", error);

            nextFunction(error);
        }
    }

    static async delete(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            req.body.uuid = uuid;
            await DatamasterSupplierService.delete(req.body);
            res.status(200).json(successResponse("data berhasil dihapus"));
        } catch (error) {
            nextFunction(error);
        }
    }
}
