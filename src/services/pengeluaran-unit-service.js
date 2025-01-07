import ZodValidator from "../validations/zod-validator.js";
import PengeluaranUnitValidation from "../validations/pengeluaran-unit-validation.js";
import {uuidv7} from "uuidv7";
import Utils from "../helpers/utils.js";
import PengeluaranUnitRepository from "../repositories/pengeluaran-unit-repository.js";
import PengeluaranUnitItemRepository from "../repositories/pengeluaran-unit-item-repository.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";

export default class PengeluaranUnitService {
    static async create(req) {
        // region VALIDATE REQUEST
        ZodValidator.validate(PengeluaranUnitValidation.CREATE, req);

        if (req.jenis_pengeluaran === "pemusnahan barang") {
            ZodValidator.validate(PengeluaranUnitValidation.CREATE_PEMUSNAHAN, req);
        }

        if (req.jenis_pengeluaran === "pengeluaran tanpa permintaan") {
            ZodValidator.validate(PengeluaranUnitValidation.CREATE_PENGELUARAN_TANPA_PERMINTAAN, req);
        } else {
            req.lokasi_stok_awal_uuid = req.lokasi_stok_tujuan_uuid;
        }
        // endregion

        // region MAPPING REQUEST
        const pengeluaranReq = {...req};
        pengeluaranReq.items = undefined;
        pengeluaranReq.uuid = uuidv7();
        pengeluaranReq.no_pengeluaran = Utils.generate4Code('PGL');


        const pengeluaranItemReq = req.items.map((item) => {
            return {
                ...item,
                pengeluaran_unit_uuid: pengeluaranReq.uuid,
                faskes_uuid: pengeluaranReq.faskes_uuid,
                uuid: uuidv7()
            }
        });

        pengeluaranReq.total_item = pengeluaranItemReq.length;
        pengeluaranReq.total_harga = pengeluaranItemReq.reduce((acc, item) => acc + (item.harga_satuan * item.qty), 0);
        // endregion

        // region INSERT REQUEST
        const transaction = await sequelizeInstance.transaction();

        try {
            await PengeluaranUnitRepository.create(pengeluaranReq, transaction);
            await PengeluaranUnitItemRepository.bulkCreate(pengeluaranItemReq, transaction);
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
        // endregion

        // region ADJUST STOCK
        try {
            if (req.jenis_pengeluaran === "pengeluaran tanpa permintaan") {
                const stocks = [];
                for (const item of pengeluaranItemReq) {
                    let stock = await StockMedisRepository.reduceQuantity({
                        stock_medis_uuid: item.stock_uuid,
                        quantity: item.qty,
                    }, transaction);

                    if (!stock) {
                        throw new BadRequestException("Stok medis tidak ditemukan");
                    }

                    stock = stock.dataValues;
                    stock.id = undefined;
                    stock.uuid = uuidv7();
                    stock.lokasi_stok_uuid = req.lokasi_stok_tujuan_uuid;
                    stock.sisa_stok = item.qty;
                    stock.stok = item.qty;

                    stocks.push(stock);
                }

                await StockMedisRepository.bulkCreate(stocks, transaction);
            } else {
                for (const item of pengeluaranItemReq) {
                    await StockMedisRepository.reduceQuantity({
                        stock_medis_uuid: item.stock_uuid,
                        quantity: item.qty,
                    }, transaction);
                }
            }
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
        // endregion

        await transaction.commit();
    }

    static async getAvailableStock(req) {
        ZodValidator.validate(PengeluaranUnitValidation.GET_AVAILABLE_STOCK, req);
        req.tanggal_pengeluaran = new Date(Number(req.tanggal_pengeluaran));
        const data = await StockMedisRepository.getAllForPengeluaran(req);

        return data.map((item) => {
            return {
                name: item.dataValues.item_medis?.name,
                uuid: item.dataValues.item_medis?.uuid,
                sisa_stok: item.dataValues.sisa_stok,
                harga_satuan: item.dataValues.harga_satuan,
                exp_date: item.dataValues.exp_date
            }
        });
    }

    static async getAll(req) {
        ZodValidator.validate(PengeluaranUnitValidation.GET_ALL, req);

        let result = await PengeluaranUnitRepository.getAll(req);

        if (!result.data) {
            throw new BadRequestException("Data not found");
        }

        result.data = result.data.map((item) => {
            return {
                no_pengeluaran: item.no_pengeluaran,
                tanggal_pengeluaran: item.tanggal_pengeluaran,
                jenis_pengeluaran: item.jenis_pengeluaran,
                kategori_item: item.kategori_item,
                jenis_item: item.jenis_item,
                petugas_pengeluaran: item.petugas_pengeluaran,
                jenis_stok: item.jenis_stok?.name,
                lokasi_stok_akhir: item.lokasi_stok_akhir?.name,
                uuid: item.uuid,
            }
        });

        return result;
    }

    static async getDetail(req) {
        ZodValidator.validate(PengeluaranUnitValidation.GET_DETAIL, req);

        const data = await PengeluaranUnitRepository.getDetail(req.uuid);

        if (!data) {
            throw new BadRequestException("Data not found");
        }

        data.dataValues.items = data.items.map((item) => {
            return {
                name: item.stok?.item_medis?.name,
                qty: item.qty,
                harga_satuan: item.harga_satuan,
                total_harga: item.qty * item.harga_satuan,
                exp_date: item.exp_date,
                stok: item.stok_awal_lokasi_pengirim,
                pengeluaran: item.qty,
                satuan: `${item.konversi?.satuan_penggunaan}/${item.konversi?.konversi}`,
                harga: item.harga_satuan,
                total: item.harga_satuan * item.qty
            }
        });
        data.dataValues.jenis_stok = data.dataValues.jenis_stok?.name;
        data.dataValues.lokasi_stok_akhir = data.dataValues.lokasi_stok_akhir?.name;

        return data;
    }
}