import RiwayatTarifService from "../services/riwayat-tarif-service.js";
import successResponse from "../responses/success-response.js";

export default class RiwayatTarifController {
    static async getAll(req, res, nextFunction) {
        try {
            const options = {
                ...req.query,
                faskes_uuid: req.author.faskesUuid,
            };
            const result = await RiwayatTarifService.getAll(options);
            res.status(200).json(successResponse("Data ditemukan", result.data, result.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getByUuid(req, res, nextFunction) {
        try {
            const options = {
                ...req.query,
                uuid: req.params.uuid,
                faskes_uuid: req.author.faskesUuid,
            };
            const result = await RiwayatTarifService.getDetail(options);
            res.status(200).json(successResponse("data ditemukan", result));
        } catch (error) {
            nextFunction(error);
        }
    }
}