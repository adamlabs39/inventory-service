import {
    MasterSupplierModel,
    PembelianBarangSupplierModel,
    ReturSupplierItemModel,
    ReturSupplierModel
} from "@adameds/model-sdk/inventory";
import Pagination from "../helpers/pagination.js";
import {Op} from "sequelize";
import sequelizeInstance from "@adameds/model-sdk/instance";
import {ConversionModel, ItemMedisModel, JenisStokModel, LokasiStokModel} from "@adameds/model-sdk/farmasi";

export default class ReturSupplierRepository {
    static async getAll(req) {
        const option = {
            where: {
                deleted_at: null,
                [Op.or]: [
                    {no_retur_supplier: {[Op.iLike]: `%${req.search || ""}%`}},
                    sequelizeInstance.where(
                        sequelizeInstance.col("spplr.name"),
                        {[Op.iLike]: `%${req.search || ""}%`}
                    )
                ],
                faskes_uuid: req.faskes_uuid,
                lokasi_stok_uuid: {
                    [Op.iLike]: `%${req.lokasi_stok_uuid || ""}%`
                },
                status: req.status,
            },
            include: [
                {
                    model: MasterSupplierModel,
                    as: "spplr",
                    required: true,
                    attributes: ["name"],
                },
                {
                    model: PembelianBarangSupplierModel,
                    as: "pembelian_barang_supplier",
                    required: false,
                    attributes: ["jenis_item", "kategori_item"],
                    include: [
                        {
                            model: JenisStokModel,
                            as: "jenis_stok",
                            required: false,
                            attributes: ["name"],
                        },
                    ],
                }
            ],
        };

        return await Pagination.init(ReturSupplierModel, req, option);
    }

    static async getDetail(req) {
        return await ReturSupplierModel.findOne({
            where: {
                uuid: req.uuid,
                faskes_uuid: req.faskes_uuid,
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
                    "id"
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
                    model: PembelianBarangSupplierModel,
                    as: "pembelian_barang_supplier",
                    required: true,
                    include: [
                        {
                            model: JenisStokModel,
                            as: "jenis_stok",
                            required: false,
                            attributes: ["name"],
                        },
                        {
                            model: LokasiStokModel,
                            as: "lks",
                            required: false,
                            attributes: ["name"]
                        }
                    ],
                },
                {
                    model: ReturSupplierItemModel,
                    as: "items",
                    required: false,
                    exclude: [
                        "deleted_at",
                        "created_at",
                        "updated_at",
                        "faskes_uuid",
                        "id"
                    ],
                    include: [
                        {
                            model: ConversionModel,
                            as: "konversi",
                            required: false,
                            attributes: {
                                exclude: ["deleted_at", "created_at", "updated_at", "faskes_uuid"]
                            }
                        },
                        {
                            model: ItemMedisModel,
                            as: "item_medis",
                            required: false,
                            attributes: ["name", "uuid"],
                        }
                    ]
                }
            ],
        });
    }

    static async create(req, transaction) {
        return await ReturSupplierModel.create(req, {transaction});
    }

    static async createItems(req, transaction) {
        return await ReturSupplierItemModel.bulkCreate(req, {transaction});
    }

    static async update(req, transaction) {
        const [affectedRow] = await ReturSupplierModel.update(
            req,
            {
                where: {
                    uuid: req.uuid
                },
                transaction
            }
        );

        if (affectedRow === 0) {
            throw new Error("Data dengan id ini tidak ditemukan");
        }
    }
}