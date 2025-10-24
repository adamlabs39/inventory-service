import StockValidation from "../validations/stock-validation.js"; 
import NotFoundException from "../errors/notfound-exception.js";
import StockRepository from "../repositories/stock-medis-repository.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import KonfigurasiHargaRepository from "../repositories/konfigurasi-harga-repository.js";
import RiwayatMutasiService from "./riwayat-mutasi-service.js";
import { ItemMedisModel } from "@adameds/model-sdk/farmasi";
import BadRequestException from "../errors/bad-request-exception.js";

export default class StockService {
    static async getAvailableStock(req) {
        const validatedReq = StockValidation.GET_STOCK.parse(req);
        const stocks = await StockRepository.findStockByItem(validatedReq);

        return stocks.map(stock => ({
            item_uuid: stock["item_medis_jenis_stok.item_medis_uuid"],
            item_name: stock["item_medis_jenis_stok.item_medis.name"],
            lokasi_stok_uuid: stock["lokasi_stok.uuid"],
            lokasi_stok_name: stock["lokasi_stok.name"],
            jenis_stok_uuid: stock["item_medis_jenis_stok.detail_stok.uuid"],
            jenis_stok_name: stock["item_medis_jenis_stok.detail_stok.name"],
            jumlah_tersedia: parseInt(stock.jumlah_tersedia, 10),
            satuan: stock["item_medis_jenis_stok.item_medis.satuan_penggunaan.name"] || "N/A",
            harga_satuan: parseFloat(stock.harga_satuan),
        }));
    }

    static async reduceStock(req) {
        const validatedData = StockValidation.REDUCE_STOCK.parse(req);
        
        const transaction = await sequelizeInstance.transaction();

        try {
            const itemMedis = await ItemMedisModel.findOne({
                where: { uuid: validatedData.item_uuid },
                attributes: ["name"],
                transaction
            });

            if (!itemMedis) {
                throw new NotFoundException(`Item medis dengan UUID ${validatedData.item_uuid} tidak ditemukan.`);
            }
            
            const konfigurasiHarga = await KonfigurasiHargaRepository.get(validatedData.faskes_uuid);
            
            const reducedStocks = await StockMedisRepository.reduceQuantity({
                item_medis_uuid: validatedData.item_uuid,
                quantity: validatedData.quantity,
                lokasi_stok_uuid: validatedData.lokasi_stok_uuid,
                jenis_stok_uuid: validatedData.jenis_stok_uuid,
                metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok || "FEFO", 
                name: itemMedis.name,
            }, transaction);

            const mutasiItems = reducedStocks.map(stock => ({
                item_uuid: validatedData.item_uuid,
                exp_date: stock.expired_date,
                stok_awal: stock.previous_stock,
                stok_mutasi: stock.quantity,
                jenis_stok_uuid: validatedData.jenis_stok_uuid,
                lokasi_stok_uuid: validatedData.lokasi_stok_uuid,
                type: "defisit" 
            }));

            await RiwayatMutasiService.create({
                faskes_uuid: validatedData.faskes_uuid,
                sumber_mutasi: validatedData.sumber_mutasi,
                code: validatedData.kode_referensi,
                petugas: validatedData.petugas,
                keterangan: { 
                    description: `Pengurangan stok dari ${validatedData.sumber_mutasi} no: ${validatedData.kode_referensi}` 
                },
                items: mutasiItems
            }, { transaction }); 

            await transaction.commit();

            return { item_uuid: validatedData.item_uuid };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async increaseStock(req) {
        const validatedData = StockValidation.INCREASE_STOCK.parse(req);
        const transaction = await sequelizeInstance.transaction();

        try {
            // --- Langkah 1: Proses semua pembaruan stok item secara paralel ---
            const stockUpdatePromises = validatedData.items.map(async (item) => {
                const payloadForRepo = {
                    item_uuid: item.item_uuid,
                    quantity_to_add: item.quantity,
                    lokasi_stok_uuid: item.lokasi_stok_uuid,
                    jenis_stok_uuid: item.jenis_stok_uuid,
                    exp_date: item.exp_date,
                    harga_satuan: item.harga_satuan,
                    faskes_uuid: validatedData.faskes_uuid,
                };

                const { previous_stock, existingStock } = await StockMedisRepository.increaseQuantity(payloadForRepo, transaction);

                if (!existingStock) {
                    throw new BadRequestException(`Batch stok asli untuk item dengan exp. date ${item.exp_date} tidak ditemukan. Retur tidak dapat diproses.`);
                }

                return { item, previous_stock };
            });

            const stockUpdateResults = await Promise.all(stockUpdatePromises);

            // --- Langkah 2: Siapkan dan catat semua riwayat mutasi dalam satu panggilan ---
            const allMutasiItems = stockUpdateResults.map(({ item, previous_stock }) => ({
                item_uuid: item.item_uuid,
                exp_date: item.exp_date,
                stok_awal: previous_stock,
                stok_mutasi: item.quantity,
                jenis_stok_uuid: item.jenis_stok_uuid,
                lokasi_stok_uuid: item.lokasi_stok_uuid,
                type: "surplus"
            }));

            // Panggil RiwayatMutasiService satu kali dengan semua item,
            await RiwayatMutasiService.create({
                faskes_uuid: validatedData.faskes_uuid,
                sumber_mutasi: validatedData.sumber_mutasi,
                code: validatedData.kode_referensi,
                petugas: validatedData.petugas,
                keterangan: {
                    description: `Penambahan stok dari ${validatedData.sumber_mutasi} no: ${validatedData.kode_referensi}`
                },
                items: allMutasiItems 
            }, { transaction });

            await transaction.commit();

            return { message: "Stok berhasil ditambahkan." };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}