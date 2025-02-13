import RiwayatMutasiService from "../services/riwayat-mutasi-service.js";

export default class RiwayatMutasiController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const result = await RiwayatMutasiService.getAll(req.query);
            res.status(200).json(result)
        } catch (error) {
            nextFunction(error);
        }
    }

    static async create(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            const result = await RiwayatMutasiService.create(req.body);
            res.status(200).json(result);
        } catch (error) {
            nextFunction(error);
        }
    }
}