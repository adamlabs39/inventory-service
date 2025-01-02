import successResponse from "../responses/success-response.js";
import PermintaanUnitService from "../services/permintaan-unit-service.js";

export default class PermintaanUnitController {
    static async getAll(req, res, nextFunction) {
        try {
            req.query.faskes_uuid = req.author.faskesUuid;
            const data = await PermintaanUnitService.getAll(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data.data, data.pagination));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getDetail(req, res, nextFunction) {
        try {
            req.query.uuid = req.params.uuid;
            const data = await PermintaanUnitService.getDetail(req.query);
            res.status(201).json(successResponse("data berhasil didapat", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async tolakPermintaan(req, res, nextFunction) {
        try {
            req.body.petugas_batal_tolak = req.author.username;
            req.body.uuid = req.params.uuid;
            await PermintaanUnitService.tolakPermintaan(req.body);
            res.status(201).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async verifikasiPermintaan(req, res, nextFunction) {
        try {
            req.body.petugas_verifikasi = req.author.username;
            req.body.uuid = req.params.uuid;
            await PermintaanUnitService.verifikasiPermintaan(req.body);
            res.status(201).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }
}