import successResponse from "../responses/success-response.js";
import VerifikasiBarangService from "../services/verifikasi-barang-service.js";

export default class VerifikasiBarangController {
    static async verifikasiPembelianBarang(req, res, nextFunction) {
        try {
            const { uuid } = req.params;
            const faskes_uuid = req.author.faskesUuid; 
            const payload = {
                uuid: uuid,
                faskes_uuid: faskes_uuid,
            }
            await VerifikasiBarangService.verifikasiPembelianBarang(payload);
            res.status(200).json(successResponse("data berhasil diverifikasi"));
        } catch (error) {
            nextFunction(error);
        }
    }
}
