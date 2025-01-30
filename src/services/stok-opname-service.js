import ZodValidator from "../validations/zod-validator.js";
import StokOpnameValidation from "../validations/stok-opname-validation.js";
import StokOpnameRepository from "../repositories/stok-opname-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";
import ItemMedisRepository from "../repositories/item-medis-repository.js";
import ExcelMapper from "../helpers/excel-mapper.js";

export default class StokOpnameService {
    static async getAll(req) {
        ZodValidator.validate(StokOpnameValidation.GET_ALL, req);

        return await StokOpnameRepository.getAll(req);
    }

    static async getDetail(req) {

    }

    static async getStockCard(req) {
        ZodValidator.validate(StokOpnameValidation.GET_STOCK_CARD, req);

        req.jenis_stok_uuids = req.jenis_stok_uuids.split(",");
        req.jenis_items = req.jenis_items.split(",");

        const result = await StokOpnameRepository.getStockCard(req);

        const response = [];

        if (result) {
            if (req.type === "master_stok") {
                result.forEach((item) => {
                    item.jenis_stok.forEach((jenisStok) => {
                        jenisStok.stocks.forEach((stock) => {
                            const expDate = stock.exp_date.toISOString().split("T")[0];

                            const existingStock = response.find(
                                res => res.exp_date === expDate &&
                                    res.name === item.name &&
                                    res.harga_satuan === stock.harga_satuan &&
                                    res.kategori_obat === item.kategori_obat?.name &&
                                    res.jenis_item === item.jenis_item &&
                                    res.jenis_stok === jenisStok.detail_stok.name
                            );

                            if (existingStock) {
                                existingStock.stok += stock.sisa_stok;
                                existingStock.stok_masuk += stock.stok;
                                existingStock.stok_keluar += (stock.stok - stock.sisa_stok);
                            } else {
                                response.push({
                                    name: item.name,
                                    exp_date: expDate,
                                    harga_satuan: stock.harga_satuan,
                                    stok_masuk: stock.stok,
                                    stok: stock.sisa_stok,
                                    stok_keluar: stock.stok - stock.sisa_stok,
                                    kategori_obat: item.kategori_obat?.name,
                                    jenis_item: item.jenis_item,
                                    jenis_stok: jenisStok.detail_stok.name,
                                });
                            }
                        });
                    })
                })
            } else {
                result.forEach((item) => {
                    item.jenis_stok.forEach((jenisStok) => {
                        if (jenisStok.stocks?.length > 0) {
                            jenisStok.stocks.forEach((stock) => {
                                const expDate = stock.exp_date.toISOString().split("T")[0];

                                const existingStock = response.find(
                                    res => res.exp_date === expDate &&
                                        res.name === item.name &&
                                        res.harga_satuan === stock.harga_satuan &&
                                        res.kategori_obat === item.kategori_obat?.name &&
                                        res.jenis_item === item.jenis_item &&
                                        res.jenis_stok === jenisStok.detail_stok.name
                                );

                                if (existingStock) {
                                    existingStock.stok += stock.sisa_stok;
                                    existingStock.stok_masuk += stock.stok;
                                    existingStock.stok_keluar += (stock.stok - stock.sisa_stok);
                                } else {
                                    response.push({
                                        name: item.name,
                                        exp_date: stock.sisa_stok === 0 ? '-' : expDate,
                                        harga_satuan: stock.sisa_stok === 0 ? 0 : stock.harga_satuan,
                                        stok_masuk: stock.sisa_stok === 0 ? 0 : stock.stok,
                                        stok: stock.sisa_stok,
                                        stok_keluar: stock.sisa_stok === 0 ? 0 : (stock.stok - stock.sisa_stok),
                                        kategori_obat: item.kategori_obat?.name,
                                        jenis_item: item.jenis_item,
                                        jenis_stok: jenisStok.detail_stok.name,
                                    });
                                }
                            });
                        } else {
                            response.push({
                                name: item.name,
                                exp_date: "-",
                                harga_satuan: 0,
                                stok_masuk: 0,
                                stok: 0,
                                stok_keluar: 0,
                                kategori_obat: item.kategori_obat?.name,
                                jenis_item: item.jenis_item,
                                jenis_stok: jenisStok.detail_stok?.name,
                            });
                        }

                    })
                })

            }
        }

        return response;
    }

    static async create(req) {
        // 1. check item medis code, if not found throw error
        // 2. check system stock and id, if both null create new stock
        // 3. check system stock and id, if one of those null throw error
        // 4. check id, if not found throw error
        // 5. update stock (system stock += (real stock - system stock))
    }

    static async saveExistingStock(req) {

    }

    static async saveInitialStock(req) {

    }

    static async importStockCard(req) {
        const stokOpname = ExcelMapper.mapStokOpname(req.data);

        const code = stokOpname.items.map(item => item.code);

        const result = await ItemMedisRepository.getByCodes(code);

        code.forEach(
            item => {
                if (!result.find(itemMedis => itemMedis.code === item)) {
                    throw new BadRequestException(`Item dengan kode ${item} tidak ditemukan`);
                }
            }
        )

        return stokOpname;
    }
}