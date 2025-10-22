import ZodValidator from "../validations/zod-validator.js";
import RiwayatMutasiValidation from "../validations/riwayat-mutasi-validation.js";
import RiwayatMutasiRepository from "../repositories/riwayat-mutasi-repository.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";

export default class RiwayatMutasiService {
    static async getAll(req) {
        ZodValidator.validate(RiwayatMutasiValidation.GET_ALL, req);

        req.start_date = Number(req.start_date);
        req.end_date = Number(req.end_date);

        const data = await RiwayatMutasiRepository.getAll(req);

        let result = {};
        result.pagination = data.pagination;

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
            };
        });

        // result.pagination = data.pagination;

        return result;
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
}