import ZodValidator from "../validations/zod-validator.js";
import PermintaanUnitValidation from "../validations/permintaan-unit-validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit-repository.js";
import BadRequestException from "../errors/bad-request-exception.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import PermintaanUnitItemRepository from "../repositories/permintaan-unit-item-repository.js";
import {uuidv7} from "uuidv7";
import Utils from "../helpers/utils.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import KonfigurasiHargaRepository from "../repositories/konfigurasi-harga-repository.js";
import RiwayatMutasiService from "./riwayat-mutasi-service.js";
import RiwayatMutasiRepository from "../repositories/riwayat-mutasi-repository.js";

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
            throw new BadRequestException("Data tidak ditemukan");
        }
    }

    static async tolakPermintaan(req) {
        ZodValidator.validate(PermintaanUnitValidation.TOLAK_PERMINTAAN, req);
        return await PermintaanUnitRepository.update(req);
    }

    static async verifikasiPermintaan(req) {
        ZodValidator.validate(PermintaanUnitValidation.VERIFIKASI_PERMINTAAN, req);

        const transaction = await sequelizeInstance.transaction();

        const permintaan = await PermintaanUnitRepository.getDetail({uuid: req.uuid});
        const noPermintaan = permintaan.dataValues.no_permintaan;
        const nonUsedItems = [];
        const halfUsedItems = [];
        const usedItems = [];

        permintaan.dataValues.items.forEach((item) => {
            const selectedItem = req.item.find((sel) => sel.uuid === item.uuid);

            if (!selectedItem) {
                nonUsedItems.push({...item.dataValues});
            } else {
                if (selectedItem.quantity < item.dataValues.qty_permintaan) {
                    const remainingQuantity = item.dataValues.qty_permintaan - selectedItem.quantity;
                    halfUsedItems.push({
                        ...item.dataValues,
                        remainingQty: remainingQuantity,
                        qty_pengiriman: selectedItem.quantity,
                        id: undefined
                    });
                } else {
                    usedItems.push({...item.dataValues, qty_pengiriman: selectedItem.quantity});
                }
            }
        });

        try {
            // region UPDATE CURRENT ITEMS
            for (const item of halfUsedItems) {
                await PermintaanUnitItemRepository.update({
                    uuid: item.uuid,
                    qty_pengiriman: item.qty_pengiriman,
                }, transaction);
            }
            // endregion

            // region CREATE NEW PERMINTAAN & DELETE NON USED ITEMS IN CURRENT PERMINTAAN
            const newPermintaan = permintaan.dataValues;
            newPermintaan.uuid = uuidv7();
            newPermintaan.no_permintaan = Utils.generate4Code('PRM');
            newPermintaan.status = "request_sebagian";

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
            // endregion

            //  region REDUCE MEDICAL STOCKS
            const konfigurasiHarga = await KonfigurasiHargaRepository.get(req.faskes_uuid);
            const medicalStocks = [];
            const mutasiItems = [];

            const allUsedItems = [...usedItems, ...halfUsedItems];

            for (const item of allUsedItems) {
                const items = await StockMedisRepository.reduceQuantity({
                    item_medis_uuid: item.item_uuid,
                    jenis_stok_uuid: newPermintaan.jenis_stok_uuid,
                    quantity: item.qty_pengiriman,
                    metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok,
                    name: item.item_medis.name,
                    lokasi_stok_uuid: newPermintaan.lokasi_stok_awal_uuid
                }, transaction);

                medicalStocks.push(...items);

                for (const reducedStock of items) {
                    mutasiItems.push({
                        item_uuid: item.item_uuid,
                        exp_date: reducedStock.expired_date,
                        stok_awal: reducedStock.previous_stock,
                        stok_mutasi: reducedStock.quantity,
                        jenis_stok_uuid: newPermintaan.jenis_stok_uuid,
                        lokasi_stok_uuid: newPermintaan.lokasi_stok_awal_uuid,
                        type: "defisit"
                    })
                }
            }
            // endregion

            // region UPDATE PERMINTAAN
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
            // endregion

            // region INSERT HISTORY MUTASI
            await RiwayatMutasiService.create({
                faskes_uuid: req.faskes_uuid,
                sumber_mutasi: "inventory",
                with_check_stock: true,
                petugas: req.petugas_verifikasi,
                code: noPermintaan,
                keterangan: {
                    description: "Pengiriman Unit",
                    // TODO : GET DESTINATION AND SOURCE DATA
                    destination: "Farmasi",
                    source: "Gudang",
                },
                items: mutasiItems
            })
            // endregion

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw new BadRequestException(e.message);
        }
    }

    static async kirimPermintaan(req) {
        ZodValidator.validate(PermintaanUnitValidation.KIRIM_PERMINTAAN, req);

        const konfigurasiHarga = await KonfigurasiHargaRepository.get(req.faskes_uuid);
        const permintaan = await PermintaanUnitRepository.getDetail({uuid: req.uuid});
        const transaction = await sequelizeInstance.transaction();

        if (!permintaan.dataValues.medical_stocks) {
            throw new BadRequestException("Stok medis tidak ditemukan");
        }

        const historyMutasi = await RiwayatMutasiRepository.getAll({
            faskes_uuid: req.faskes_uuid,
            code: permintaan.dataValues.no_permintaan,
            limit: 100000
        })

        try {
            let medicalStocks = await StockMedisRepository.getSome(permintaan.dataValues.medical_stocks.map((item) => item.stock_medis_uuid));

            if (medicalStocks.length < permintaan.dataValues.medical_stocks.length) {
                throw new BadRequestException("Stok medis tidak ditemukan");
            }

            medicalStocks = medicalStocks.map((item) => {
                const quantity = permintaan.dataValues.medical_stocks.find((stock) => stock.stock_medis_uuid === item.uuid)?.quantity;
                return {
                    ...item.dataValues,
                    lokasi_stok_uuid: permintaan.dataValues.lokasi_stok_tujuan_uuid,
                    sisa_stok: quantity,
                    stok: quantity,
                    uuid: uuidv7(),
                    id: undefined,
                    harga_satuan: item.harga_satuan +
                        (item.harga_satuan * konfigurasiHarga.margin) +
                        (item.harga_satuan * konfigurasiHarga.ppn),
                }
            });

            await StockMedisRepository.bulkCreate(medicalStocks, transaction);

            await PermintaanUnitRepository.update({
                uuid: req.uuid,
                status: "dikirim",
                petugas_pengiriman: req.petugas_kirim,
                catatan_pengiriman: req.catatan_pengiriman
            }, transaction);

            await RiwayatMutasiService.create({
                faskes_uuid: req.faskes_uuid,
                sumber_mutasi: "inventory",
                petugas: req.petugas_kirim,
                code: permintaan.dataValues.no_permintaan,
                keterangan: historyMutasi.data[0]?.keterangan ?? {},
                with_check_stock: true,
                items: historyMutasi.data.map((item) => {
                    return {
                        item_uuid: item.item_uuid,
                        exp_date: item.exp_date,
                        stok_mutasi: item.stok_mutasi,
                        jenis_stok_uuid: permintaan.jenis_stok_uuid,
                        lokasi_stok_uuid: permintaan.lokasi_stok_tujuan_uuid,
                        type: "surplus",
                        petugas: req.petugas_kirim,
                        keterangan: item.keterangan
                    }
                })
            })

            await transaction.commit();

        } catch (e) {
            await transaction.rollback();
            throw new BadRequestException(e.message);
        }
    }
}