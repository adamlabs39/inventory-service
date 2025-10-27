import ZodValidator from "../validations/zod-validator.js";
import PengeluaranUnitValidation from "../validations/pengeluaran-unit-validation.js";
import {uuidv7} from "uuidv7";
import Utils from "../helpers/utils.js";
import PengeluaranUnitRepository from "../repositories/pengeluaran-unit-repository.js";
import PengeluaranUnitItemRepository from "../repositories/pengeluaran-unit-item-repository.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import RiwayatMutasiService from "./riwayat-mutasi-service.js";
import InternalServerException from "../errors/internal-server-exception.js";

export default class PengeluaranUnitService {
    static async create(req) {
        let validatedData = await PengeluaranUnitValidation.CREATE.parseAsync(req);

        let lokasiStokAwalUuidToUse;
        let lokasiStokTujuanUuidForHeader = null;
        let jenisPemusnahanForHeader = null;

        if (validatedData.jenis_pengeluaran === "pemakaian unit") {
            lokasiStokAwalUuidToUse = validatedData.lokasi_stok_tujuan_uuid; 
        } else if (validatedData.jenis_pengeluaran === "pemusnahan barang") {
            lokasiStokAwalUuidToUse = validatedData.lokasi_stok_awal_uuid;
            jenisPemusnahanForHeader = validatedData.jenis_pemusnahan;
        } else { 
            lokasiStokAwalUuidToUse = validatedData.lokasi_stok_awal_uuid;
            lokasiStokTujuanUuidForHeader = validatedData.lokasi_stok_tujuan_uuid;
        }

        const transaction = await sequelizeInstance.transaction();

        try {
            const pengeluaranHeader = {
                faskes_uuid: validatedData.faskes_uuid,
                jenis_pengeluaran: validatedData.jenis_pengeluaran,
                jenis_item: validatedData.jenis_item,
                kategori_item: validatedData.kategori_item,
                jenis_stok_uuid: validatedData.jenis_stok_uuid,
                tanggal_pengeluaran: validatedData.tanggal_pengeluaran,
                petugas_pengeluaran: validatedData.petugas_pengeluaran,
                petugas_pengeluaran_uuid: validatedData.petugas_pengeluaran_uuid,
                catatan: validatedData.catatan,
                lokasi_stok_awal_uuid: lokasiStokAwalUuidToUse,
                lokasi_stok_tujuan_uuid: lokasiStokTujuanUuidForHeader,
                jenis_pemusnahan: jenisPemusnahanForHeader,
                uuid: uuidv7(),
                no_pengeluaran: Utils.generate4Code("PGL"),
                total_item: validatedData.items.length,
                total_harga: validatedData.items.reduce((acc, item) => acc + (item.harga_satuan * item.qty), 0),
            };

            const pengeluaranItems = validatedData.items.map((item) => ({
                ...item,
                pengeluaran_unit_uuid: pengeluaranHeader.uuid,
                faskes_uuid: validatedData.faskes_uuid,
                uuid: uuidv7()
            }));

            await PengeluaranUnitRepository.create(pengeluaranHeader, transaction);
            await PengeluaranUnitItemRepository.bulkCreate(pengeluaranItems, transaction);

            const allMutasiItems = []; 
            for (const item of pengeluaranItems) {
                const affectedStocks = await StockMedisRepository.reduceQuantity({
                    stock_medis_uuid: item.stock_uuid, 
                    quantity: item.qty,
                    faskes_uuid: validatedData.faskes_uuid,
                    lokasi_stok_awal_uuid: lokasiStokAwalUuidToUse 
                }, transaction);

                if (!affectedStocks) { 
                    throw new InternalServerException(`Pengurangan stok gagal untuk ${item.stock_uuid}`);
                }

                const stockDataFromSource = affectedStocks;

                const jenisStokFromHeader = validatedData.jenis_stok_uuid;
                const jenisStokFromBatch = stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid;

                if (jenisStokFromHeader !== jenisStokFromBatch) {
                    throw new BadRequestException("Data tidak cocok");
                }

                allMutasiItems.push({
                    item_uuid: stockDataFromSource.item_medis_jenis_stok.item_medis_uuid,
                    exp_date: stockDataFromSource.exp_date, 
                    stok_awal: stockDataFromSource.previous_stock, 
                    stok_mutasi: item.qty * -1, 
                    jenis_stok_uuid: stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid,
                    lokasi_stok_uuid: lokasiStokAwalUuidToUse,
                    type: "defisit"
                });

                if (validatedData.jenis_pengeluaran === "pengeluaran tanpa permintaan") {
                    const { previous_stock: targetPreviousStock } = await StockMedisRepository.increaseQuantity({
                        item_uuid: stockDataFromSource.item_medis_jenis_stok.item_medis_uuid,
                        quantity_to_add: item.qty,
                        lokasi_stok_uuid: validatedData.lokasi_stok_tujuan_uuid, 
                        jenis_stok_uuid: stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid,
                        exp_date: stockDataFromSource.exp_date,
                        harga_satuan: stockDataFromSource.harga_satuan,
                        konversi_uuid: stockDataFromSource.konversi_uuid,
                        faskes_uuid: validatedData.faskes_uuid,
                        no_po: stockDataFromSource.no_po,
                    }, transaction);

                    allMutasiItems.push({
                        item_uuid: stockDataFromSource.item_medis_jenis_stok.item_medis_uuid,
                        exp_date: stockDataFromSource.exp_date,
                        stok_awal: targetPreviousStock, 
                        stok_mutasi: item.qty, 
                        jenis_stok_uuid: stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid,
                        lokasi_stok_uuid: validatedData.lokasi_stok_tujuan_uuid,
                        type: "surplus"
                    });
                }
            }

            if (allMutasiItems.length > 0) {
                 await RiwayatMutasiService.create({
                    faskes_uuid: validatedData.faskes_uuid,
                    sumber_mutasi: "inventory",
                    petugas: validatedData.petugas_pengeluaran,
                    code: pengeluaranHeader.no_pengeluaran,
                    keterangan: { description: validatedData.jenis_pengeluaran },
                    items: allMutasiItems,
                }, { transaction });
            }

            await transaction.commit();

        } catch (e) {
            await transaction.rollback();
            throw e; 
        }
    }

    static async getAvailableStock(req) {
        ZodValidator.validate(PengeluaranUnitValidation.GET_AVAILABLE_STOCK, req);
        req.tanggal_pengeluaran = new Date(Number(req.tanggal_pengeluaran));
        const data = await StockMedisRepository.getAllForPengeluaran(req);

        return data.map((item) => {
            return {
                name: item.item_medis_jenis_stok?.item_medis?.name,
                uuid: item.item_medis_jenis_stok?.item_medis?.uuid,
                sisa_stok: item.sisa_stok,
                harga_dasar: item.harga_satuan,
                exp_date: item.exp_date
            };
        });
    }

    static async getAll(req) {
        const validatedReq = await PengeluaranUnitValidation.GET_ALL.parseAsync(req);
        let result = await PengeluaranUnitRepository.getAll(validatedReq);
        if (result && result.data) {
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
                };
            });
        }
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
                name: item.stok?.item_medis_jenis_stok?.item_medis?.name,
                qty: item.qty,
                harga_satuan: item.harga_satuan,
                total_harga: item.qty * item.harga_satuan,
                exp_date: item.exp_date,
                stok: item.stok_awal_lokasi_pengirim,
                pengeluaran: item.qty,
                satuan: `${item.konversi?.satuan_penggunaan}/${item.konversi?.konversi}`,
                harga: item.harga_satuan,
                total: item.harga_satuan * item.qty
            };
        });
        data.dataValues.jenis_stok = data.dataValues.jenis_stok?.name;
        data.dataValues.lokasi_stok_akhir = data.dataValues.lokasi_stok_akhir?.name;

        return data;
    }
}