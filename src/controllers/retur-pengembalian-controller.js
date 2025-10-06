import successResponse from "../responses/success-response.js";
import ReturSupplierService from "../services/retur-supplier-service.js";

export default class ReturPengembalianController {
    static async getAll(req, res, nextFunction) {
        try {
            const options = {
                ...req.query,
                faskes_uuid: req.author.faskesUuid,
            }
            const data = await ReturSupplierService.getAll(options);
            res.status(200).json(successResponse("Data ditemukan", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getByUuid(req, res, nextFunction) {
        try {
            const payload = {
                uuid: req.params.uuid,
                faskes_uuid: req.author.faskesUuid,
            };
            const data = await ReturSupplierService.getDetail(payload);
            res.status(200).json(successResponse("data ditemukan", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async create(req, res, nextFunction) {
        try {
            const payload = {
                ...req.body,
                faskes_uuid: req.author.faskesUuid,
                petugas_retur: req.author.username,
                petugas_retur_uuid: req.author.user_uuid,
            }
            await ReturSupplierService.create(payload);
            res.status(201).json(successResponse("data berhasil disimpan"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAvailableFaktur(req, res, nextFunction) {
        try {
            const options = {
                ...req.query,
                faskes_uuid: req.author.faskesUuid,
            }
            const data = await ReturSupplierService.getAvailableFaktur(options);
            res.status(200).json(successResponse("data ditemukan", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getFaktur(req, res, nextFunction) {
        try {
            const options = {
                ...req.query,
                uuid: req.params.uuid,
                faskes_uuid: req.author.faskesUuid,
                petugas_retur: req.author.username,
            };
            const data = await ReturSupplierService.getFakturDetail(options);
            res.status(200).json(successResponse("data ditemukan", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async acceptReplacement(req, res, nextFunction) {
        try {
            const payload = {
                ...req.body,
                uuid: req.params.uuid,
                faskes_uuid: req.author.faskesUuid,
                petugas_replacement: req.author.username,
            };
            await ReturSupplierService.acceptReplacement(payload);
            res.status(200).json(successResponse("data berhasil disimpan"));
        } catch (error) {
            nextFunction(error);
        }
    }
}