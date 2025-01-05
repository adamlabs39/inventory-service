import ZodValidator from "../validations/zod-validator.js";
import PermintaanUnitValidation from "../validations/permintaan-unit-validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import PermintaanUnitItemRepository from "../repositories/permintaan-unit-item-repository.js";
import { uuidv7 } from "uuidv7";
import Utils from "../helpers/utils.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import KonfigurasiHargaRepository from "../repositories/konfigurasi-harga-repository.js";

export default class PermintaanUnitService {
    static async getAll(req) {
        ZodValidator.validate(PermintaanUnitValidation.GET_ALL, req);

        req.status = req.status ? req.status.split(",") : ['request', 'request_sebagian', 'verified', 'verif_sebagian', 'dikirim', 'cancel'];

        const result = await PermintaanUnitRepository.getAll(req);

        if (result) {
            const data = [];
            result.data.forEach((item) => {
                item["lokasi_stok_tujuan"] = item.lokasi_stok_tujuan.name;
                data.push(item);
            });

            result.data = data;

            return result;
        } else {
            return []
        }
    }

    static async getDetail(req) {
        ZodValidator.validate(PermintaanUnitValidation.GET_DETAIL, req);
        const result = await PermintaanUnitRepository.getDetail(req);

        if (result) {
            result.lokasi_stok_tujuan = result.lokasi_stok_tujuan?.name;

            result.items.forEach((item) => {
                item.dataValues.item_medis = item.item_medis?.name;
                item.dataValues.konversi = `${item.konversi?.satuan_pembelian}/${item.konversi?.konversi}`;
                item.dataValues.stok_awal_lokasi_penerima = `${item.stok_awal_lokasi_penerima} ${item.konversi?.satuan_penggunaan}`;
            })

            return result;
        } else {
            throw new BadRequestException({ message: "Data tidak ditemukan" });
        }
    }

    static async tolakPermintaan(req) {
        ZodValidator.validate(PermintaanUnitValidation.TOLAK_PERMINTAAN, req);
        return await PermintaanUnitRepository.update(req);
    }

    static async verifikasiPermintaan(req) {
        ZodValidator.validate(PermintaanUnitValidation.VERIFIKASI_PERMINTAAN, req);

        const transaction = await sequelizeInstance.transaction();

        const permintaan = await PermintaanUnitRepository.getDetail({ uuid: req.uuid });
        const nonUsedItems = [];
        const halfUsedItems = [];
        const usedItems = [];

        permintaan.items.foreach((item) => {
            const selectedItem = req.item.find((sel) => sel.id === item.id);

            if (!selectedItem) {
                nonUsedItems.push({ ...item });
            } else {
                if (selectedItem.quantity < item.quantity) {
                    const remainingQuantity = item.quantity - selectedItem.quantity;
                    halfUsedItems.push({ ...item, remainingQty: remainingQuantity, qty_pengiriman: selectedItem.quantity });
                } else {
                    usedItems.push({ ...item, qty_pengiriman: selectedItem.quantity });
                }
            }
        });

        try {
            // UPDATE CURRENT ITEMS
            for (const item of halfUsedItems) {
                await PermintaanUnitItemRepository.update({
                    uuid: item.uuid,
                    qty_pengiriman: item.qty_pengiriman,
                }, transaction);
            }

            // CREATE NEW PERMINTAAN & DELETE NON USED ITEMS IN CURRENT PERMINTAAN
            const newPermintaan = permintaan.dataValues;
            newPermintaan.uuid = uuidv7();
            newPermintaan.no_permintaan = Utils.generate4Code('PRM');

            await PermintaanUnitRepository.create(newPermintaan, transaction);

            for (const item of nonUsedItems) {
                await PermintaanUnitItemRepository.update({
                    uuid: item.uuid,
                    permintaan_unit_uuid: newPermintaan.uuid,
                }, transaction);
            }

            for (const item of halfUsedItems) {
                await PermintaanUnitItemRepository.create({
                    ...item,
                    uuid: uuidv7(),
                    qty_permintaan: item.remainingQty,
                }, transaction);
            }

            // TODO : REDUCE MEDICAL STOCKS
            const konfigurasiHarga = await KonfigurasiHargaRepository.get(req.faskes_uuid);
            const medicalStocks = [];

            for (const item of halfUsedItems) {
                const items = await StockMedisRepository.reduceQuantity({
                    item_medis_uuid: item.item_uuid,
                    jenis_stok_uuid: newPermintaan.jenis_stok_uuid,
                    quantity: item.qty_pengiriman,
                    metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok,
                    name: item.item_medis.name,
                    lokasi_stok_uuid: newPermintaan.lokasi_stok_awal_uuid
                }, transaction);

                medicalStocks.push(items);
            }

            for (const item of usedItems) {
                const items = await StockMedisRepository.reduceQuantity({
                    item_medis_uuid: item.item_uuid,
                    jenis_stok_uuid: newPermintaan.jenis_stok_uuid,
                    quantity: item.qty_pengiriman,
                    metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok,
                    name: item.item_medis.name,
                    lokasi_stok_uuid: newPermintaan.lokasi_stok_awal_uuid
                }, transaction);

                medicalStocks.push(items);
            }

            // UPDATE PERMINTAAN
            await PermintaanUnitRepository.update({
                uuid: req.uuid,
                status:
                    nonUsedItems.length === 0 && 
                    halfUsedItems.length === 0 && 
                    permintaan.status === "request" ?
                        "verified" : "verif_sebagian",
                petugas_verifikasi: req.petugas_verifikasi,
                total_item: usedItems.length + halfUsedItems.length,
                medical_stocks: medicalStocks
            }, transaction);


            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw new BadRequestException({ message: e.message });
        }
    }

    static async kirimPermintaan(req) {
        ZodValidator.validate(PermintaanUnitValidation.KIRIM_PERMINTAAN, req);

        const konfigurasiHarga = await KonfigurasiHargaRepository.get(req.faskes_uuid);
        const permintaan = await PermintaanUnitRepository.getDetail({ uuid: req.uuid });
        const transaction = await sequelizeInstance.transaction();

        try {
            if (permintaan.dataValues.medical_stocks) {
                let medicalStocks = StockMedisRepository.getSome(permintaan.dataValues.medical_stocks.map((item) => item.uuid));
    
                if (medicalStocks.length < permintaan.dataValues.medical_stocks.length) {
                    throw new BadRequestException({ message: "Stok medis tidak ditemukan" });
                }
    
                medicalStocks = medicalStocks.map((item) => {
                    return {
                        ...item,
                        sisa_stok: permintaan.dataValues.medical_stocks.find((stock) => stock.uuid === item.uuid).quantity,
                        stok: permintaan.dataValues.medical_stocks.find((stock) => stock.uuid === item.uuid).quantity,
                        uuid: uuidv7(),
                        harga_satuan: item.harga_satuan +
                            (item.harga_satuan * konfigurasiHarga.margin) +
                            (item.harga_satuan * konfigurasiHarga.ppn),
                    }
                });
    
    
                await StockMedisRepository.bulkCreate(medicalStocks, transaction);
    
                await PermintaanUnitRepository.update({
                    uuid: req.uuid,
                    status: "dikirim",
                    petugas_pengiriman: req.petugas_pengiriman,
                    catatan_pengiriman: req.catatan_pengiriman
                }, transaction);
    
                await transaction.commit();
            }
        } catch (e) {
            await transaction.rollback();
            throw new BadRequestException({ message: e.message });
        }

        return await PermintaanUnitRepository.update(req);
    }

}