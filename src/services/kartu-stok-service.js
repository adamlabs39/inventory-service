import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import KartuStokValidation from "../validations/kartu-stok-validation.js";

export default class KartuStokService {
    static async getAll(req) {
        ZodValidator.validate(KartuStokValidation.GET_ALL, req);
        let data = await ItemMedisJenisStokRepository.getForKartuStok(req);

        let result = {};

        result.pagination = data.pagination
        
        result.data = data.data?.map((item) => {
            return {
                nama: item.item_medis?.name,
                kategori: "Medis",
                jenis_stok: item.detail_stok?.name,
                jenis_item: item.item_medis?.jenis_item,
                kategori_obat: item.item_medis?.kategori_obat?.name,
                lokasi_stok: item.stocks[0]?.lokasi_stok?.name,
                sisa_stok: item.stocks?.reduce((acc, item) => acc + item.sisa_stok, 0),
            }
        });

        return result;
    }
}