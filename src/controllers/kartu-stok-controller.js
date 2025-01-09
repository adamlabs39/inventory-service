import KartuStokService from "../services/kartu-stok-service.js";
import successResponse from "../responses/success-response.js";

export default class KartuStokController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await KartuStokService.getAll(req.query);
            res.status(200).json(successResponse("data berhasil didapat", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }
}