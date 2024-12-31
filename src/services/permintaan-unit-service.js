import ZodValidator from "../validations/zod-validator.js";
import PermintaanUnitValidation from "../validations/permintaan-unit-validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";

export default class PermintaanUnitService {
    static async getAll(req) {
        ZodValidator.validate(PermintaanUnitValidation.GET_ALL, req);

        req.status = req.status ? req.status.split(",") : ['request', 'request_sebagian', 'verified', 'verif_sebagian', 'dikirim', 'cancel'];

        const result = await PermintaanUnitRepository.getAll(req);

        if (result) {
            const data = [];
            result.data.forEach((item) => {
                item["lokasi_stok_tujuan"] = item.lokasi_stok_tujuan.name;
                data.push(item);
            });

            result.data = data;

            return result;
        } else {
            return []
        }
    }

    static async getDetail(req){
        ZodValidator.validate(PermintaanUnitValidation.GET_DETAIL, req);
        const result = await PermintaanUnitRepository.getDetail(req);

        if(result){
            result.lokasi_stok_tujuan = result.lokasi_stok_tujuan?.name;

            result.items.forEach((item) => {
                item.dataValues.item_medis = item.item_medis?.name;
                item.dataValues.konversi = `${item.konversi?.satuan_pembelian}/${item.konversi?.konversi}`;
                item.dataValues.stok_awal_lokasi_penerima = `${item.stok_awal_lokasi_penerima} ${item.konversi?.satuan_penggunaan}`;
            })

            return result;
        } else {
            throw new BadRequestException({message: "Data tidak ditemukan"});
        }
    }

    static async tolakPermintaan(req){
        ZodValidator.validate(PermintaanUnitValidation.TOLAK_PERMINTAAN, req);
        return await PermintaanUnitRepository.update(req);
    }
}