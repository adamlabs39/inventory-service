import successResponse from "../responses/success-response.js";
import VerifikasiBarangService from "../services/verifikasi-barang-service.js";

export default class VerifikasiBarangController {
    static async verifikasiPembelianBarang(req, res, nextFunction) {
        try {
            const {uuid} = req.params;
            req.body.uuid = uuid;
            await VerifikasiBarangService.verifikasiPembelianBarang(req.body);
            res.status(200).json(successResponse("data berhasil diverifikasi"));
        } catch (error) {
            nextFunction(error);
        }
    }
}
