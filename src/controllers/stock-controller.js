import successResponse from "../responses/success-response.js";
import StockService from "../services/stock-service.js";

export default class StockController {
    static async getAvailableStock(req, res, next) {
        try {
            const options = {
                item_uuids: req.query.item_uuids ? req.query.item_uuids.split(',') : [],
                lokasi_stok_uuid: req.query.lokasi_stok_uuid,
                faskes_uuid: req.author.faskesUuid
            }
            const result = await StockService.getAvailableStock(options);
            res.status(200).json(successResponse("Data ditemukan", result));
        } catch (error) {
            next(error);
        }
    }

    static async reduceStock(req, res, next) {
        try {
            const payload = {
                ...req.body,
                faskes_uuid: req.author.faskesUuid,
                petugas: req.author.username
            };
            const result = await StockService.reduceStock(payload);
            res.status(200).json(successResponse("Data berhasil diupdate", result));
        } catch (error) {
            next(error);
        }
    }
}