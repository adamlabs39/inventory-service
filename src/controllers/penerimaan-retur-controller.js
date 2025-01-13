import successResponse from "../responses/success-response.js";
import PenerimaanReturService from "../services/penerimaan-retur-service.js";

export default class PenerimaanReturController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await PenerimaanReturService.getAll(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getDetail(req, res, nextFunction) {
        try {
            req.query.uuid = req.params.uuid;
            const data = await PenerimaanReturService.getDetail(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data));
        } catch (error) {
            nextFunction(error);
        }
    }
}