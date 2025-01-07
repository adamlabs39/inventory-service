import successResponse from "../responses/success-response.js";
import PengeluaranUnitService from "../services/pengeluaran-unit-service.js";

export default class PengeluaranUnitController {
    static async create(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.petugas_pengeluaran = req.author.username;

            // TODO :UNCOMMENT THIS AUTHOR UUID
            // req.body.petugas_pengeluaran_uuid = req.author.uuid;
            req.body.petugas_pengeluaran_uuid = "0192b31f-365d-731c-8b16-3a4565c9475e";

            await PengeluaranUnitService.create(req.body);

            res.status(201).json(successResponse("data berhasil dibuat"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAvailableItems(req, res, nextFunction) {
        try {
            const data = await PengeluaranUnitService.getAvailableStock(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await PengeluaranUnitService.getAll(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getDetail(req, res, nextFunction) {
        try {
            req.query.uuid = req.params.uuid
            const data = await PengeluaranUnitService.getDetail(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data.dataValues));
        } catch (error) {
            nextFunction(error);
        }
    }
}