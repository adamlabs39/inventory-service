import successResponse from "../responses/success-response.js";
import PrescriptionService from "../services/prescription-service.js";
import AlkesService from "../services/alkes-service.js";
import AlkesRepository from "../repositories/alkes-repository.js";

export default class AlkesController {
    static async orderAlkes(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.petugas_order = req.author.username;

            const result = await AlkesService.orderAlkes(req.body);

            res.status(200).json(successResponse("data berhasil dibuat", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async addAlkesItems(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.order_alkes_uuid = req.params.uuid;
            const result = await AlkesService.addAlkesItems(req.body);
            res.status(200).json(successResponse("data berhasil ditambahkan", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async deleteAlkesItem(req, res, nextFunction) {
        try {
            await AlkesService.deleteAlkes(req.params);
            res.status(200).json(successResponse("data berhasil dihapus"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getByUuid(req, res, nextFunction) {
        try {
            const result = await AlkesService.getByUuid(req.params.uuid);
            res.status(200).json(successResponse("data berhasil ditemukan", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateAlkes(req, res, nextFunction) {
        try {
            req.body.uuid = req.params.uuid;
            await AlkesService.updateAlkes(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateAlkesItem(req, res, nextFunction) {
        try {
            req.body.uuid = req.params.uuid;
            req.body.faskes_uuid = req.author.faskesUuid;
            await AlkesService.updateAlkesItem(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getOrderByRekamMedis(req, res, nextFunction){
        try {
            const result = await AlkesService.getOrderBySomeUuid(req.query);
            res.status(200).json(successResponse("data berhasil ditemukan", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async batalOrder(req, res, nextFunction){
        try {
            req.body.petugas_pembatalan = req.author.username;
            req.body.uuid = req.params.uuid;
            await AlkesService.batalOrder(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateVerifikasi(req, res, nextFunction){
        try {
            req.body.petugas_verifikasi = req.author.username;
            req.body.faskes_uuid = req.author.faskesUuid;
            await AlkesService.updateVerifikasi(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateSiapDiserahkan(req, res, nextFunction){
        try {
            req.body.petugas_penyiapan_obat = req.author.username;
            await AlkesService.updateSiapDiserahkan(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateDiserahkan(req, res, nextFunction){
        try {
            req.body.petugas_pemberi = req.author.username;
            await AlkesService.updateDiserahkan(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async batalSiapDiserahkan(req, res, nextFunction){
        try {
            await AlkesService.batalSiapDiserahkan(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateLokasiStok(req, res, nextFunction){
        try {
            await AlkesService.updateLokasiStok(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAllForFarmacy(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            const result = await AlkesService.getAllForFarmacy(req.body);
            res.status(200).json(successResponse("data berhasil diupdate", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateJenisStokItem(req, res, nextFunction){
        try {
            req.body.uuid = req.params.uuid;
            await AlkesService.updateJenisItem(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }
}