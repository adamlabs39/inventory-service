import KartuStokService from "./kartu-stok-service.js";
import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import StokAdjustmentValidation from "../validations/stok-adjustment-validation.js";
import BadRequestException from "../errors/bad-request-exception.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import RiwayatMutasiService from "./riwayat-mutasi-service.js";
import Utils from "../helpers/utils.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import NotfoundException from "../errors/notfound-exception.js";

export default class StokAdjustmentService {
    static async getAll(req) {
        return await KartuStokService.getAll(req);
    }

    static async getDetail(req) {
        ZodValidator.validate(StokAdjustmentValidation.GET_DETAIL, req);
        const data = await ItemMedisJenisStokRepository.getDetailForStokAdjustment(req);

        if (!data) {
            throw new NotfoundException("UUID tidak ditemukan");
        } else {
            return data.dataValues.stocks.map((item) => {
                return {
                    exp_date: item.exp_date,
                    sisa_stok: item.sisa_stok,
                    uuid: item.uuid,
                    nama: data.item_medis?.name,
                    kategori: "Medis",
                    jenis_stok: data.detail_stok?.name,
                    jenis_item: data.item_medis?.jenis_item,
                    kategori_obat: data.item_medis?.kategori_obat?.name,

                }
            });
        }
    }

    static async update(req) {
        ZodValidator.validate(StokAdjustmentValidation.UPDATE, req);

        const stock = await StockMedisRepository.getDetail(req);

        if (!stock) {
            throw new BadRequestException("Data not found");
        }

        const transaction = await sequelizeInstance.transaction();

        req.exp_date = new Date(req.exp_date);

        try {
            await StockMedisRepository.update(req);

            await RiwayatMutasiService.create({
                faskes_uuid: req.faskes_uuid,
                sumber_mutasi: "inventory",
                with_check_stock: true,
                petugas: req.petugas_sa,
                code: Utils.generate4Code("SAD"),
                keterangan: {
                    description: "Stok Adjustment",
                    ed_before: stock.exp_date,
                    ed_after: req.exp_date,
                },
                items: [{
                    item_uuid: stock.item_medis_jenis_stok.item_medis_uuid,
                    exp_date: stock.exp_date,
                    stok_awal: stock.sisa_stok,
                    stok_mutasi: req.sisa_stok,
                    jenis_stok_uuid: stock.item_medis_jenis_stok.jenis_stok_uuid,
                    lokasi_stok_uuid: stock.lokasi_stok_uuid,
                    type: stock.sisa_stok > req.sisa_stok ? "defisit" : "surplus"
                }]
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    }
}