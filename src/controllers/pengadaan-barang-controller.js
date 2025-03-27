import successResponse from "../responses/success-response.js";
import PengadaanBarangService from "../services/pengadaan-barang-service.js";

export default class PengadaanBarangController {
    static async create(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            const result = await PengadaanBarangService.orderBarang(req.body);
            res.status(201).json(successResponse("data berhasil dibuat", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getAll(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            req.body.no_po = req.query.no_po;
            req.body.filter = req.query.filter;
            req.body.page = req.query.page;
            req.body.limit = req.query.limit;
            const result = await PengadaanBarangService.getAll(req.body);
            res
                .status(200)
                .json(
                    successResponse(
                        "data berhasil didapat",
                        result.data,
                        result.pagination
                    )
                );
        } catch (error) {
            nextFunction(error);
        }
    }

    static async getDetail(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            req.body.uuid = uuid;
            const result = await PengadaanBarangService.getDetail(req.body);
            res.status(200).json(successResponse("data berhasil didapat", result));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async cancelPembelianBarang(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            req.body.uuid = uuid;
            await PengadaanBarangService.cancelPembelianBarang(req.body);
            res.status(200).json(successResponse("data berhasil dibatalkan"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async update(req, res, nextFunction) {
        try {
            req.body.faskes_uuid = req.author.faskesUuid;
            const {uuid} = req.params;
            req.body.uuid = uuid;
            await PengadaanBarangService.update(req.body);
            res.status(200).json(successResponse("data berhasil diupdate"));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async delete(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            req.body.uuid = uuid;
            await DatamasterBentukRacikanService.delete(req.body);
            res.status(200).json(successResponse("data berhasil dihapus"));
        } catch (error) {
            nextFunction(error);
        }
    }
}
