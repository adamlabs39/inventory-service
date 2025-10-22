import successResponse from "../responses/success-response.js";
import LokasiGudangService from "../services/lokasi-gudang-service.js";

export default class LokasiGudangController {
    static async getLokasiGudang(req, res, next) {
        try {
            const options = {
                search: req.query.search,
                page: req.query.page,
                limit: req.query.limit,
                faskes_uuid: req.author.faskesUuid
            };
            const result = await LokasiGudangService.getLokasiGudang(options, req);
            res.status(200).json(successResponse("Data lokasi gudang berhasil diambil", result.data, result.pagination));
        } catch (error) {
            next(error);
        }
    }
}