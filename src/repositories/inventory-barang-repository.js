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
        const option = {
            where: {
                faskes_uuid: req.faskes_uuid,
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
                // no_surat_jalan: data.no_surat_jalan,
                petugas_penerima: payload.petugas_penerima,
                petugas_penerima_uuid: payload.petugas_penerima_uuid,
                tanggal_faktur: payload.tanggal_faktur,
                tanggal_penerimaan: payload.tanggal_terima,
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
            include: {
                model: MasterSupplierModel,
                as: 'spplr',
                required: true,
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
