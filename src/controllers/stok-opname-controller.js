import StokOpnameService from "../services/stok-opname-service.js";
import successResponse from "../responses/success-response.js";

export default class StokOpnameController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid
            const data = await StokOpnameService.getAll(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getDetail(req, res, nextFunction) {
        try {
            req.query.uuid = req.params.uuid;
            const data = await StokOpnameService.getDetail(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getStockCard(req, res, nextFunction) {
        try {
            req.query.uuid = req.params.uuid;
            const data = await StokOpnameService.getStockCard(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async create(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.petugas = req.author.username;
            await StokOpnameService.create(req.body);
            res.status(201).json(successResponse("data berhasil ditambahkan"));
        } catch (error) {
            nextFunction(error);
        }
    }
}