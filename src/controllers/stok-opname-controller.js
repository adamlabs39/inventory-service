import StokOpnameService from "../services/stok-opname-service.js";
import successResponse from "../responses/success-response.js";
import Utils from "../helpers/utils.js";

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
            req.query.faskes_uuid = req.author.faskesUuid;
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

    static async importStockCard(req, res, nextFunction) {
        try {
            req.body.data = Utils.parseExcelToJSON(req);

            const result = await StokOpnameService.importStockCard(req.body);

            res.status(201).json(successResponse("data berhasil ditambahkan", result));

        } catch (e) {
            nextFunction(e);
        }
    }

    // 0. delete stok opname if exist
    // 1. insert into stok opname
    // 2. send success to user, then turn into pubsub mode
    // 3. validate data

    // if save as final (not draft)
    // 4. adjust stock in stok medis
    // 5. update status in stok opname
}