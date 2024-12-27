import PrescriptionValidation from "../validations/prescription-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import BadRequestException from "../errors/bad-request-exception.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import DataMasterLokasiStokRepository from "../repositories/datamaster-lokasi-stok-repository.js";
import InternalServerException from "../errors/internal-server-exception.js";
import Utils from "../helpers/utils.js";
import {toEpochDate} from "../helpers/date-helper.js";
import KonfigurasiHargaService from "./konfigurasi-harga-service.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import DataMasterItemMedisRepository from "../repositories/datamaster-item-medis-repository.js";
import AlkesValidation from "../validations/alkes-validation.js";
import AlkesRepository from "../repositories/alkes-repository.js";

export default class AlkesService {
    static async getByUuid(uuid) {
        const alkes = await AlkesRepository.getByUuid(uuid);
        if (alkes === null) {
            throw new BadRequestException("data tidak ditemukan");
        }
        return alkes;
    }

    static async orderAlkes(req) {
        req.order_status = 1;
        const transaction = await sequelizeInstance.transaction();

        // generate no prescription
        req.no_order_alkes = Utils.generate4Code('ORD');

        // validate input
        ZodValidator.validate(AlkesValidation.ORDER_ALKES, req);
        if (req.alkes === null || req.alkes === undefined) {
            throw new BadRequestException("'alkes' tidak boleh kosong");
        }

        req.harga_total = 0;

        // get default lokasi stok
        const lokasiStocks = await DataMasterLokasiStokRepository.getAll({
            faskes_uuid: req.faskes_uuid,
            jenis_lokasi: "depo",
            limit: 100
        });

        const lokasi = lokasiStocks.data.find(
            item => item
                .default_tujuan_order_permintaan
                .includes(
                    Utils.pelayananToJenisStockCode(req.jenis_pelayanan)
                )
        );

        if (!lokasi) {
            throw new InternalServerException(`lokasi stok belum di set untuk pelayanan ${req.jenis_pelayanan}`);
        }

        req.lokasi_stok_uuid = lokasi.uuid;

        try {
            // create alkes
            const order_alkes = await AlkesRepository.createAlkes(req, transaction);
            const order_alkes_uuid = order_alkes.dataValues.uuid;
            order_alkes.dataValues.alkes_items = [];

            // create alkes item
            for (const item of req.alkes) {
                item.order_alkes_uuid = order_alkes_uuid;
                item.faskes_uuid = req.faskes_uuid;

                ZodValidator.validate(AlkesValidation.CREATE_ALKES_ITEM, item);

                item.harga_satuan = 0;

                const alkes_item =
                    await AlkesRepository.createAlkesItem(item, transaction);
                order_alkes.dataValues.alkes_items.push(alkes_item);
            }

            await transaction.commit();

            return order_alkes;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async addAlkesItems(req) {
        const transaction = await sequelizeInstance.transaction();

        if (req.alkes_items === null || req.alkes_items === undefined) {
            throw new BadRequestException("'alkes_items' tidak boleh kosong");
        }

        try {
            for (const item of req.alkes_items) {
                item.order_alkes_uuid = req.order_alkes_uuid;
                item.faskes_uuid = req.faskes_uuid;
                item.harga_satuan = 0;

                ZodValidator.validate(AlkesValidation.CREATE_ALKES_ITEM, item);

                await AlkesRepository.createAlkesItem(item, transaction);
            }


            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async deleteAlkes(req) {
        ZodValidator.validate(AlkesValidation.DELETE_ALKES_ITEM, req);
        const result = await AlkesRepository.deleteAlkesItem(req.alkes_item_uuid);

        if (result === 0) {
            throw new BadRequestException("data tidak ditemukan");
        }
        return result;
    }

    static async updateAlkes(req) {
        ZodValidator.validate(AlkesValidation.UPDATE_ALKES, req);
        return await AlkesRepository.editAlkes(req);
    }

    static async updateAlkesItem(req) {
        ZodValidator.validate(AlkesValidation.UPDATE_ALKES_ITEM, req);

        return await AlkesRepository.editAlkesItem(req);
    }

    static async getOrderBySomeUuid(req) {
        ZodValidator.validate(AlkesValidation.GET_SOME_ORDER, req);
        const rawData = await AlkesRepository.getOrderBySomeUuid(req);
        let data = [];

        for (const resep of rawData) {
            resep.dataValues.jumlah_item = resep.dataValues.alkes_items.length;

            resep.dataValues.lokasi_stok = resep.dataValues.lokasi_stok.name;

            resep.dataValues.alkes_items = undefined;

            data.push(resep.dataValues);
        }

        return data;
    }

    static async batalOrder(req) {
        ZodValidator.validate(AlkesValidation.BATAL_ORDER, req);
        req.order_status = 0;
        return await AlkesRepository.editAlkes(req);
    }

    static async updateVerifikasi(req) {
        ZodValidator.validate(PrescriptionValidation.UPDATE_VERIFIKASI, req);

        const transaction = await sequelizeInstance.transaction();

        // get konfigurasi harga
        const konfigurasiHarga = await KonfigurasiHargaService.get(req);

        // get all prescription item
        const alkes = await AlkesRepository.getByUuid(req.uuid);

        try {
            req.harga_total = await this.setPriceInOrderAlkes(alkes, konfigurasiHarga, transaction);

            // loop for reduce stock
            for (const alkesIitem of alkes.alkes_items) {
                const usedStock = await StockMedisRepository.reduceQuantity({
                    item_medis_uuid: alkesIitem.item_medis_uuid,
                    jenis_stok_uuid: alkesIitem.jenis_stok_uuid,
                    quantity: alkesIitem.qty,
                    lokasi_stok_uuid: alkes.lokasi_stok_uuid,
                    metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok,
                    name: alkesIitem?.item_medis?.name ?? ""
                }, transaction)

                const item = {
                    uuid: alkesIitem.uuid,
                    stok_medis_uuides: usedStock
                }

                await AlkesRepository.editAlkesItem(item, transaction);
            }

            // update prescription
            req.order_status = 2;
            req.waktu_verifikasi = toEpochDate(new Date());
            await AlkesRepository.editAlkes(req, transaction);

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }

        return alkes;
    }

    static async updateSiapDiserahkan(req) {
        ZodValidator.validate(PrescriptionValidation.UPDATE_SIAP_DISERAHKAN, req);
        req.order_status = 3;
        req.waktu_penyiapan = toEpochDate(new Date());
        return await AlkesRepository.editAlkes(req);
    }

    static async batalSiapDiserahkan(req) {
        ZodValidator.validate(PrescriptionValidation.BATAL_DISERAHKAN, req);
        req.order_status = 3;
        return await AlkesRepository.editAlkes(req);
    }

    static async updateDiserahkan(req) {
        ZodValidator.validate(AlkesValidation.UPDATE_SERAHKAN, req);
        req.order_status = 4;
        req.waktu_pemberian = toEpochDate(new Date());
        return await AlkesRepository.editAlkes(req);
    }

    static async updateLokasiStok(req) {
        ZodValidator.validate(PrescriptionValidation.UPDATE_LOKASI_STOK, req);
        return await AlkesRepository.editAlkesItem(req);
    }

    static async getAllForFarmacy(req) {
        ZodValidator.validate(PrescriptionValidation.GET_ALL, req);
        const rawData = await AlkesRepository.getAllForFarmacy(req);

        let order_masuk = [];
        let sedang_disiapkan = [];
        let penyerahan_alkes = [];

        for (const resep of rawData) {
            if (resep.order_status === 1) {
                order_masuk.push(resep);
            } else if (resep.order_status === 2) {
                sedang_disiapkan.push(resep);
            } else if (resep.order_status === 3) {
                penyerahan_alkes.push(resep);
            }

            resep.dataValues.patient = resep.patient?.name;
            resep.dataValues.lokasi = resep.lokasi?.name;
        }

        return {
            order_masuk,
            sedang_disiapkan,
            penyerahan_alkes
        }
    }

    static async updateJenisItem(req) {
        ZodValidator.validate(AlkesValidation.UPDATE_JENIS_ITEM, req);

        return await AlkesRepository.editAlkesItem(req);
    }

    static async setPriceInOrderAlkes(alkes, konfigurasiHarga, transaction) {
        let totalHarga = 0;

        for (const item of alkes.alkes_items) {
            const hargaItem = await DataMasterItemMedisRepository.getPrice({
                item_medis_uuid: item.item_medis_uuid,
                jenis_stok_uuid: item.jenis_stok_uuid
            });

            if (hargaItem === null) {
                throw new BadRequestException(`harga item medis ${item?.item_medis?.name ?? ""} tidak ditemukan`);
            }

            if (konfigurasiHarga.metode_hpp === "avg") {
                item.dataValues.harga_satuan = hargaItem.detail_harga[0].dataValues.harga_avg;
            } else {
                item.dataValues.harga_satuan = hargaItem.detail_harga[0].dataValues.harga_terakhir;
            }

            totalHarga += item.harga_satuan * item.qty;

            await AlkesRepository.editAlkesItem({
                uuid: item.uuid,
                harga_satuan: item.harga_satuan,
            }, transaction)
        }

        return totalHarga;
    }
}