import ZodValidator from "../validations/zod-validator.js";
import RiwayatMutasiValidation from "../validations/riwayat-mutasi-validation.js";
import RiwayatMutasiRepository from "../repositories/riwayat-mutasi-repository.js";

export default class RiwayatMutasiService {
    static async getAll(req) {
        ZodValidator.validate(RiwayatMutasiValidation.GET_ALL, req);

        req.start_date = Number(req.start_date);
        req.end_date = Number(req.end_date);

        const data = await RiwayatMutasiRepository.getAll(req);

        const result = {};
        result.data = data.data.map((item) => {
            return {
                transaksi: {
                    code: item.code,
                    sumber_mutasi: item.sumber_mutasi,
                    tanggal: item.created_at,
                },
                item: {
                    name: item.detail_item?.name,
                    jenis_item: item.detail_item?.jenis_item,
                    code: item.detail_item?.code,
                    kategori: "Medis",
                    jenis_stok: item.jenis_stok?.name,
                },
                exp_date: item.exp_date,
                keterangan: item.keterangan,
                petugas: item.petugas,
                stok_awal: item.stok_awal,
                stok_mutasi: item.stok_mutasi,
                sisa_stok: item.stok_awal + item.stok_mutasi,
            }
        });

        result.pagination = data.pagination;

        return result;
    }

    static async create(req) {
        ZodValidator.validate(RiwayatMutasiValidation.CREATE, req);

        await RiwayatMutasiRepository.create(req);
    }
}