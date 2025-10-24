import ZodValidator from "../validations/zod-validator.js";
import RiwayatMutasiValidation from "../validations/riwayat-mutasi-validation.js";
import RiwayatMutasiRepository from "../repositories/riwayat-mutasi-repository.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";

export default class RiwayatMutasiService {
    static async getAll(req) {
        const validatedReq = await ZodValidator.validate(RiwayatMutasiValidation.GET_ALL, req);
        const { data: rawData, pagination } = await RiwayatMutasiRepository.getAll(validatedReq);
        const mappedData = rawData?.map(item => this._transformToMutasiDTO(item));
        return { pagination: pagination,  data: mappedData || [] };
    }

    static async create(req, options = {}) {
        ZodValidator.validate(RiwayatMutasiValidation.CREATE, req);

        for (const item of req.items) {
            if (item.exp_date && typeof item.exp_date === "string") {
                item.exp_date = new Date(item.exp_date);
            }
        }
        
        const mutasi = [];

        req.items.forEach((item) => {
            const existingStock = mutasi.find(
                res => res.exp_date === item.exp_date &&
                    res.item_uuid === item.item_uuid &&
                    res.lokasi_stok_uuid === item.lokasi_stok_uuid &&
                    res.jenis_stok_uuid === item.jenis_stok_uuid &&
                    res.type === item.type
            );

            if (existingStock) {
                existingStock.stok_awal += item.stok_awal;
                existingStock.stok_mutasi += item.stok_mutasi;
            } else {
                mutasi.push({
                    ...item,
                    faskes_uuid: req.faskes_uuid,
                    sumber_mutasi: req.sumber_mutasi,
                    petugas: req.petugas,
                    code: req.code,
                    keterangan: req.keterangan,
                });
            }
        });

        if (req.with_check_stock) {
            const stocks = await StockMedisRepository.getForMutasi({
                lokasi_stok_uuids: mutasi.map(item => item.lokasi_stok_uuid),
                item_uuids: mutasi.map(item => item.item_uuid),
                jenis_stok_uuids: mutasi.map(item => item.jenis_stok_uuid),
            });


            mutasi.forEach((item) => {
                item.stok_awal = 0;
                for (const stock of stocks) {
                    if (stock.exp_date?.toISOString() === item.exp_date?.toISOString() &&
                        stock.lokasi_stok_uuid === item.lokasi_stok_uuid &&
                        stock.item_medis_jenis_stok?.item_medis_uuid === item.item_uuid &&
                        stock.item_medis_jenis_stok?.jenis_stok_uuid === item.jenis_stok_uuid) {
                        item.stok_awal += stock.sisa_stok;
                    }
                }
            });
        }

        await RiwayatMutasiRepository.create(mutasi, options);
    }

    static _transformToMutasiDTO(item) {
        return {
            kode_transaksi: item.code,
            sumber_mutasi: item.sumber_mutasi,
            tanggal_mutasi: item.created_at,

            nama_item: item.detail_item?.name,
            kode_item: item.detail_item?.code,
            jenis_item: item.detail_item?.jenis_item,
            jenis_stok: item.jenis_stok?.name,
            kategori_item: "Medis",

            exp_date: item.exp_date, 
            stok_awal: item.stok_awal,
            stok_masuk: item.stok_mutasi > 0 ? item.stok_mutasi : 0, 
            stok_keluar: item.stok_mutasi < 0 ? Math.abs(item.stok_mutasi) : 0, 
            sisa_stok: item.stok_awal + item.stok_mutasi,

            petugas: item.petugas,
            keterangan: typeof item.keterangan === "object" && item.keterangan !== null 
                        ? item.keterangan.description 
                        : item.keterangan,
        };
    }
}