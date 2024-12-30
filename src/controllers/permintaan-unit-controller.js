import successResponse from "../responses/success-response.js";
import PermintaanUnitService from "../services/permintaan-unit-service.js";

export default class PermintaanUnitController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await PermintaanUnitService.getAll(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }
}