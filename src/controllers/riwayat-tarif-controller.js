import RiwayatTarifService from "../services/riwayat-tarif-service.js";
import successResponse from "../responses/success-response.js";

export default class RiwayatTarifController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const result = await RiwayatTarifService.getAll(req.query);
            res.status(200).json(successResponse("data ditemukan", result.data, result.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getByUuid(req, res, nextFunction) {
        try {
            req.query.uuid = req.params.uuid;
            req.query.faskes_uuid = req.author.faskesUuid;
            const result = await RiwayatTarifService.getDetail(req.query);
            res.status(200).json(successResponse("data ditemukan", result));
        } catch (error) {
            nextFunction(error);
        }
    }
}