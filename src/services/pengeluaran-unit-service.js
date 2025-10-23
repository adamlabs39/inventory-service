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

export default class PengeluaranUnitService {
    static async create(req) {
        let validatedData;
        let lokasiStokAwalUuidToUse;
        
        if (req.jenis_pengeluaran === "pemusnahan barang") {
        validatedData = await PengeluaranUnitValidation.CREATE_PEMUSNAHAN.parseAsync(req);
        lokasiStokAwalUuidToUse = validatedData.lokasi_stok_tujuan_uuid; 
        } else if (req.jenis_pengeluaran === "pengeluaran tanpa permintaan") {
            validatedData = await PengeluaranUnitValidation.CREATE_PENGELUARAN_TANPA_PERMINTAAN.parseAsync(req);
            lokasiStokAwalUuidToUse = validatedData.lokasi_stok_awal_uuid; 
        } else {
            validatedData = await PengeluaranUnitValidation.CREATE.parseAsync(req);
            lokasiStokAwalUuidToUse = validatedData.lokasi_stok_tujuan_uuid; 
        }

        const transaction = await sequelizeInstance.transaction();

        try {
            const pengeluaranHeader = {
                ...validatedData,
                items: undefined, 
                uuid: uuidv7(),
                no_pengeluaran: Utils.generate4Code("PGL"),
                lokasi_stok_awal_uuid: lokasiStokAwalUuidToUse,
            };

            const pengeluaranItems = validatedData.items.map((item) => ({
                ...item,
                pengeluaran_unit_uuid: pengeluaranHeader.uuid,
                faskes_uuid: validatedData.faskes_uuid,
                uuid: uuidv7()
            }));

            pengeluaranHeader.total_item = pengeluaranItems.length;
            pengeluaranHeader.total_harga = pengeluaranItems.reduce((acc, item) => acc + (item.harga_satuan * item.qty), 0);

            await PengeluaranUnitRepository.create(pengeluaranHeader, transaction);
            await PengeluaranUnitItemRepository.bulkCreate(pengeluaranItems, transaction);
            const allMutasiItems = []; 

            for (const item of pengeluaranItems) {
                const stockDataFromSource = await StockMedisRepository.getDetail({ 
                    uuid: item.stock_uuid, 
                    faskes_uuid: validatedData.faskes_uuid 
                }); 
                if (!stockDataFromSource || !stockDataFromSource.item_medis_jenis_stok) {
                    throw new NotfoundException(`Detail stok sumber dengan UUID ${item.stock_uuid} atau relasinya tidak ditemukan.`);
                }

                const jenisStokFromHeader = validatedData.jenis_stok_uuid;
                const jenisStokFromBatch = stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid;

                if (jenisStokFromHeader !== jenisStokFromBatch) {
                    throw new BadRequestException(
                        `Jenis Stok (${jenisStokFromHeader}) tidak cocok ` +
                        `dengan Jenis Stok item (${item.stock_uuid}) yang dikeluarkan (${jenisStokFromBatch}).`
                    );
                }

                const affectedStocks = await StockMedisRepository.reduceQuantity({
                    stock_medis_uuid: item.stock_uuid, 
                    quantity: item.qty,
                    faskes_uuid: validatedData.faskes_uuid,
                }, transaction);

                 if (!affectedStocks || !Array.isArray(affectedStocks)){
                     const reducedStockInfo = Array.isArray(affectedStocks) ? affectedStocks[0] : affectedStocks; 
                     if(!reducedStockInfo) {
                        throw new InternalServerException(`Pengurangan stok gagal untuk ${item.stock_uuid}`);
                     }
                      allMutasiItems.push({
                         item_uuid: stockDataFromSource.item_medis_jenis_stok.item_medis_uuid,
                         exp_date: stockDataFromSource.exp_date, 
                         stok_awal: reducedStockInfo.previous_stock, 
                         stok_mutasi: item.qty * -1, 
                         jenis_stok_uuid: stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid,
                         lokasi_stok_uuid: lokasiStokAwalUuidToUse,
                         type: "defisit"
                     });
                 } else {
                      for (const reducedStock of affectedStocks) {
                          allMutasiItems.push({
                              item_uuid: stockDataFromSource.item_medis_jenis_stok.item_medis_uuid,
                              exp_date: reducedStock.expired_date, 
                              stok_awal: reducedStock.previous_stock,
                              stok_mutasi: reducedStock.quantity * -1, 
                              jenis_stok_uuid: stockDataFromSource.item_medis_jenis_stok.jenis_stok_uuid,
                              lokasi_stok_uuid: lokasiStokAwalUuidToUse,
                              type: "defisit"
                          });
                      }
                 }

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
                harga_satuan: item.harga_satuan,
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