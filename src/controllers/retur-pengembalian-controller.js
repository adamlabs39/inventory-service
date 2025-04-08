import successResponse from "../responses/success-response.js";
import ReturSupplierService from "../services/retur-supplier-service.js";

export default class ReturPengembalianController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await ReturSupplierService.getALl(req.query);
            res.status(200).json(successResponse("data ditemukan", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getByUuid(req, res, nextFunction) {
        try {
            const data = await ReturSupplierService.getDetail(req.params);
            res.status(200).json(successResponse("data ditemukan", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async create(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.petugas_retur = req.author.username;
            req.body.petugas_retur_uuid = req.author.user_uuid;
            await ReturSupplierService.create(req.body);
            res.status(201).json(successResponse("data berhasil disimpan"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAvailableFaktur(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await ReturSupplierService.getAvailableFaktur(req.query);
            res.status(200).json(successResponse("data ditemukan", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getFaktur(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            req.query.uuid = req.params.uuid;
            req.query.petugas_retur = req.author.username;
            const data = await ReturSupplierService.getFakturDetail(req.query);
            res.status(200).json(successResponse("data ditemukan", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async acceptReplacement(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.uuid = req.params.uuid;
            req.body.petugas_replacement = req.author.username;
            await ReturSupplierService.acceptReplacement(req.body);
            res.status(200).json(successResponse("data berhasil disimpan"));
        } catch (error) {
            nextFunction(error);
        }
    }
}