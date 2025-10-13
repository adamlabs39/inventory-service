import Pagination from "../helpers/pagination.js";
import {Op, where} from "sequelize";
import {toEpochDate} from "../helpers/date-helper.js";
import {
    PembelianBarangSupplierModel,
    PembelianBarangSupplierItemModel,
    MasterSupplierModel,
    StockMedisModel,
} from "@adameds/model-sdk/inventory";
import {ConversionModel, ItemMedisModel, JenisStokModel, LokasiStokModel} from "@adameds/model-sdk/farmasi";
import sequelizeInstance from "../configurations/sequelize-instance.js";

sequelizeInstance.sync({
    alter: true,
    logging: console.log,
});

export default class InventoryBarangRepository {
    static async createPembelianBarang(req, transaction) {
        const dataForModel = { ...req };
        if (dataForModel.hasOwnProperty('is_cito')) {
            dataForModel.isCito = req.is_cito;
            delete dataForModel.is_cito;
        }
        return await PembelianBarangSupplierModel.create(dataForModel, {transaction});
    }

    // create prescription item
    static async createPembelianBarangItem(req, transaction) {
        return await PembelianBarangSupplierItemModel.create(req, {transaction});
    }

    static async create(req) {
        return await PembelianBarangSupplierModel.create({
            code: req.code,
            name: req.name,
            status: req.status,
        });
    }

    static async getDataPurchaseOrder(req) {
        return await PembelianBarangSupplierModel.findOne({
            where: {
                uuid: req.uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
            attributes: {
                exclude: [
                    "deleted_at",
                    "created_at",
                    "updated_at",
                    "faskes_uuid",
                    "no_surat_jalan",
                ],
            },
            include: [
                {
                    model: PembelianBarangSupplierItemModel,
                    as: "pbsu",
                    required: false,
                    where: {
                        deleted_at: {
                            [Op.is]: null,
                        },
                    },
                    attributes: {
                        exclude: ["deleted_at", "created_at", "updated_at", "faskes_uuid"],
                    },
                },
            ],
        });
    }

    static async getAll(req) {
            const whereClause = {
                faskes_uuid: req.faskes_uuid,
                status: req.filter,
                deleted_at: {
                    [Op.is]: null,
                },
            };

            const includeOptions = [
                {
                    model: MasterSupplierModel,
                    as: "spplr",
                    required: true,
                    attributes: ["name"]
                },
                {
                    model: JenisStokModel,
                    as: "jenis_stok",
                    required: false,
                    attributes: ["name"]
                }
            ];

            if (req.search) {
                whereClause[Op.or] = [
                    { no_po: { [Op.iLike]: `%${req.search}%` } },
                    { '$spplr.name$': { [Op.iLike]: `%${req.search}%` } }
                ];
            }

            const option = {
                where: whereClause,
                attributes: {
                    exclude: [
                        "deleted_at", "created_at", "updated_at",
                        "faskes_uuid", "no_surat_jalan",
                    ],
                },
                include: includeOptions,
                subQuery: false,
            };

        return Pagination.init(PembelianBarangSupplierModel, req, option);
    }

    static async getDetail(payload) {
        return await PembelianBarangSupplierModel.findOne({
            where: {
                faskes_uuid: payload.faskes_uuid,
                uuid: payload.uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
            attributes: {
                exclude: [
                    "deleted_at",
                    "created_at",
                    "updated_at",
                    "faskes_uuid",
                ],
            },
            include: [
                {
                    model: MasterSupplierModel,
                    as: "spplr",
                    required: false,
                    attributes: ["name"]
                },
                {
                    model: LokasiStokModel,
                    as: "lks",
                    required: false,
                    attributes: ["name"]
                },
                {
                    model: JenisStokModel,
                    as: "jenis_stok",
                    required: false,
                    attributes: ["name"]
                },
                {
                    model: PembelianBarangSupplierItemModel,
                    as: "pbsu",
                    required: false,
                    attributes: {
                        exclude: ["deleted_at", "created_at", "updated_at", "faskes_uuid"],
                    },
                    include: [
                        {
                            model: ConversionModel,
                            as: "cnvrsn",
                            required: false,
                            attributes: {
                                exclude: [
                                    "deleted_at",
                                    "created_at",
                                    "updated_at",
                                    "faskes_uuid",
                                ],
                            },
                        },
                        {
                            model: ItemMedisModel,
                            as: "item_medis",
                            required: false,
                            attributes: ["name"]
                        }
                    ],
                },
            ],
        });
    }

    static async bulkCreate(req, transaction) {
        return await PembelianBarangSupplierItemModel.bulkCreate(req, {
            transaction,
        });
    }

    static async update(payload) {
        return await PembelianBarangSupplierModel.update(
            {
                status: "cancel",
                alasan_batal: payload.alasan_batal,
            },
            {
                where: {
                    faskes_uuid: payload.faskes_uuid,
                    uuid: payload.uuid,
                },
            }
        );
    }

    static async updateVerifikasi(payload) {
        return await PembelianBarangSupplierModel.update(
            {
                status: "verifikasi",
            },
            {
                where: {
                    uuid: payload.uuid,
                    faskes_uuid: payload.faskes_uuid,
                },
            }
        );
    }

    static async updateStatusToDiterima(payload, transaction) {
        return await PembelianBarangSupplierModel.update(
            {
                status: "diterima",
                no_faktur: payload.no_faktur,
                no_surat_jalan: payload.no_surat_jalan,
                petugas_penerima: payload.petugas_penerima,
                petugas_pengirim: payload.petugas_pengirim,
                petugas_penerima_uuid: payload.petugas_penerima_uuid,
                tanggal_faktur: payload.tanggal_faktur,
                tanggal_penerimaan: payload.tanggal_terima,
                catatan_penerimaan: payload.catatan_penerimaan,
            },
            {
                where: {
                    uuid: payload.uuid,
                    faskes_uuid: payload.faskes_uuid,
                },
                transaction
            }
        );
    }

    static async updatePurchaseOrder(payload, transaction) {
        const { uuid, faskes_uuid, ...dataToUpdate } = payload;
        return await PembelianBarangSupplierModel.update(dataToUpdate, {
            where: {
                uuid: uuid,
                faskes_uuid: faskes_uuid,
            },
            transaction,
        });
    }

    static async updatePurchaseOrderItems(payload, transaction) {
        const { uuid, faskes_uuid, ...dataToUpdate } = payload;
        return await PembelianBarangSupplierItemModel.update(dataToUpdate, {
            where: {
                uuid: uuid,
                faskes_uuid: faskes_uuid, 
            },
            transaction,
        });
    }

    static async bulkCreateStokMedis(payload, transaction) {
        return await StockMedisModel.bulkCreate(payload, {
            transaction,
        });
    }
    
    static async deletePurchaseOrder(po_uuid, transaction) {
        return await PembelianBarangSupplierItemModel.destroy({
            where: {
                pembelian_barang_supplier_uuid: po_uuid,
            },
            transaction,
        });
    }

    static async delete(payload) {
        return await PembelianBarangSupplierModel.update(
            {
                deleted_at: toEpochDate(new Date()),
            },
            {
                where: {
                    uuid: payload.uuid,
                    faskes_uuid: payload.faskes_uuid, 
                },
            }
        );
    }

    static async getForRetur(req) {
        const option = {
            where: {
                faskes_uuid: req.faskes_uuid,
                is_return: null,
            },
            attributes: [
                'uuid',
                'no_faktur',
                'tanggal_faktur',
                ['no_po', 'no_penerimaan'],
                'tanggal_penerimaan',
                [sequelizeInstance.col('spplr.name'), 'supplier']
            ],
            include: [
                {
                    model: MasterSupplierModel,
                    as: 'spplr',
                    required: true,
                    attributes: []
                }
            ],
            nest: true,
        };

        if (req.search) {
            option.where.no_faktur = {[Op.iLike]: `%${req.search || ""}%`};
        }

        if (req.date) {
            const [ day, month, year ] = req.date.split('-').map(Number);
            const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
            const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

            option.where.tanggal_penerimaan = {
                [Op.between]: [toEpochDate(startOfDay), toEpochDate(endOfDay)]
            };
        }

        return await Pagination.init(PembelianBarangSupplierModel, req, option);
    }

    static async changeReturnStatus(req, transaction) {
        return await PembelianBarangSupplierModel.update(
            {
                is_return: true,
            },
            {
                where: {
                    uuid: req.uuid,
                },
                transaction
            }
        );
    }
}
