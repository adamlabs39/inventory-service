import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import KartuStokValidation from "../validations/kartu-stok-validation.js";

export default class KartuStokService {
    static async getAll(req) {
        ZodValidator.validate(KartuStokValidation.GET_ALL, req);
        const { pagination, data: rawData } = await ItemMedisJenisStokRepository.getForKartuStok(req);
        const transformedData = rawData?.map(item => this._transformToKartuStokDTO(item, req.lokasi_stok_uuid));
        return { pagination: pagination, data: transformedData };
    }

    static _transformToKartuStokDTO(item, lokasiStokUuid) {
        const totalSisaStock = item.stocks?.reduce((acc, stockBatch) => acc + stockBatch.sisa_stok, 0);
        return {
            uuid: item.uuid,
            nama: item.item_medis?.name,
            kategori: "Medis", 
            jenis_stok: item.detail_stok?.name,
            jenis_item: item.item_medis?.jenis_item,
            kategori_obat: item.item_medis?.kategori_obat?.name,
            satuan_obat: item.item_medis?.satuan_kemasan?.name,
            lokasi_stok_uuid: lokasiStokUuid, 
            lokasi_stok: item.stocks[0]?.lokasi_stok?.name,
            sisa_stok: totalSisaStock,
        };
    };
}