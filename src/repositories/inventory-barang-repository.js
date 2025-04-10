import Pagination from "../helpers/pagination.js";
import {Op} from "sequelize";
import {toEpochDate} from "../helpers/date-helper.js";
import {
    PembelianBarangSupplierModel,
    PembelianBarangSupplierItemModel,
    MasterSupplierModel,
    StockMedisModel,
} from "@adameds/model-sdk/inventory";
import {ConversionModel, ItemMedisModel, JenisStokModel, LokasiStokModel} from "@adameds/model-sdk/farmasi";

PembelianBarangSupplierModel.hasMany(PembelianBarangSupplierItemModel, {
    foreignKey: "pembelian_barang_supplier_uuid",
    as: "pbsu",
    constraints: false,
});
PembelianBarangSupplierModel.belongsTo(MasterSupplierModel, {
    foreignKey: "supplier_uuid",
    as: "spplr",
    constraints: false,
});

PembelianBarangSupplierItemModel.belongsTo(ConversionModel, {
    foreignKey: "konversi_uuid",
    as: "cnvrsn",
    constraints: false,
});

PembelianBarangSupplierModel.belongsTo(LokasiStokModel, {
    foreignKey: "lokasi_stok_uuid",
    as: "lks",
    constraints: false,
});

PembelianBarangSupplierModel.belongsTo(JenisStokModel, {
    foreignKey: "jenis_stok_uuid",
    as: "jenis_stok",
    constraints: false,
})

PembelianBarangSupplierItemModel.belongsTo(ItemMedisModel, {
    foreignKey: "item_uuid",
    as: "item_medis",
    constraints: false,
});

export default class InventoryBarangRepository {
    static async createPembelianBarang(req, transaction) {
        return await PembelianBarangSupplierModel.create(req, {transaction});
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
        const option = {
            where: {
                no_po: {[Op.iLike]: `%${req.no_po || ""}%`},
                status: req.filter,
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
                    model: MasterSupplierModel,
                    as: "spplr",
                    required: false,
                    attributes: ["name"]
                }
            ],
        };

        return Pagination.init(PembelianBarangSupplierModel, req, option);
    }

    static async getDetail(req) {
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

    static async update(req) {
        return await PembelianBarangSupplierModel.update(
            {
                status: "cancel",
                alasan_batal: req.alasan_batal,
            },
            {
                where: {
                    uuid: req.uuid,
                },
            }
        );
    }

    static async updateVerifikasi(req) {
        return await PembelianBarangSupplierModel.update(
            {
                status: "verifikasi",
            },
            {
                where: {
                    uuid: req.uuid,
                },
            }
        );
    }

    static async updateDiterima(req) {
        return await PembelianBarangSupplierModel.update(
            {
                status: "diterima",
                alasan_batal: req.alasan_batal,
            },
            {
                where: {
                    uuid: req.uuid,
                },
            }
        );
    }

    static async updatePurchaseOrder(req, transaction) {
        return await PembelianBarangSupplierModel.update(req, {
            where: {
                uuid: req.uuid,
            },
            transaction,
        });
    }

    static async updatePurchaseOrderItems(req, transaction) {
        return await PembelianBarangSupplierItemModel.update(req, {
            where: {
                uuid: req.uuid,
            },
            transaction,
        });
    }

    static async bulkCreateStokMedis(req, transaction) {
        return await StockMedisModel.bulkCreate(req, {
            transaction,
        });
    }

    static async delete(req) {
        return await PembelianBarangSupplierModel.update(
            {
                deleted_at: toEpochDate(new Date()),
            },
            {
                where: {
                    uuid: req.uuid,
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
            include: {
                model: MasterSupplierModel,
                as: 'spplr',
                required: false,
                attributes: ['name']
            }
        };

        if (req.search) {
            option.where.no_faktur = {[Op.iLike]: `%${req.search || ""}%`};
        }

        if (req.start_date && req.end_date) {
            option.where.tanggal_faktur = {
                [Op.gte]: toEpochDate(req.start_date),
                [Op.lte]: toEpochDate(req.end_date),
            }
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
