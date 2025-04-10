import {Op} from "sequelize";
import BadRequestException from "../errors/bad-request-exception.js";
import {StockMedisModel} from "@adameds/model-sdk/inventory";
import {
    ConversionModel,
    ItemMedisJenisStokModel,
    ItemMedisModel,
    JenisStokModel, ManufactureModel,
    SatuanModel
} from "@adameds/model-sdk/farmasi";
import Pagination from "../helpers/pagination.js";

export default class StockMedisRepository {
    static async reduceQuantity(req, t) {
        if (req.item_medis_uuid) {
            let remainingQuantity = req.quantity;
            let stock;
            const today = new Date();
            let result = [];

            let order = [];

            if (req.metode_pemotongan_stok === "FEFO") {
                order.push(["exp_date", "ASC"]);
            } else if (req.metode_pemotongan_stok === "FIFO") {
                order.push(["created_at", "ASC"]);
            } else {
                order.push(["created_at", "DESC"]);
            }

            const sisaStockRaw = await StockMedisModel.findAll({
                where: {
                    sisa_stok: {
                        [Op.gt]: 0
                    },
                    exp_date: {
                        [Op.gt]: today
                    },
                    lokasi_stok_uuid: req.lokasi_stok_uuid,
                },
                attributes: ['sisa_stok'],
                include: [
                    {
                        model: ItemMedisJenisStokModel,
                        as: 'item_medis_jenis_stok',
                        required: true,
                        where: {
                            jenis_stok_uuid: req.jenis_stok_uuid,
                            item_medis_uuid: req.item_medis_uuid,
                        },
                        attributes: ['uuid'],
                    }
                ],
                transaction: t,
            });

            const totalStock = sisaStockRaw.reduce((acc, curr) => acc + curr.sisa_stok, 0);

            if (totalStock < req.quantity) {
                throw new BadRequestException(`${req.name} not enough or empty (total stock : ${totalStock})`);
            }

            while (remainingQuantity > 0) {
                stock = await StockMedisModel.findOne({
                    where: {
                        sisa_stok: {
                            [Op.gt]: 0
                        },
                        exp_date: {
                            [Op.gt]: today
                        },
                        lokasi_stok_uuid: req.lokasi_stok_uuid,
                    },
                    include: [
                        {
                            model: ItemMedisJenisStokModel,
                            as: 'item_medis_jenis_stok',
                            required: true,
                            where: {
                                item_medis_uuid: req.item_medis_uuid,
                                jenis_stok_uuid: req.jenis_stok_uuid,
                            },
                            attributes: ['uuid'],
                        }
                    ],
                    order: order,
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                const newStock = stock.sisa_stok - remainingQuantity;

                if (newStock >= 0) {
                    await StockMedisModel.update(
                        {sisa_stok: newStock},
                        {
                            where: {uuid: stock.uuid},
                            transaction: t
                        }
                    );

                    result.push({
                        stock_medis_uuid: stock.uuid,
                        quantity: remainingQuantity,
                        previous_stock: stock.sisa_stok,
                        expired_date: stock.exp_date,
                    });

                    remainingQuantity = 0;
                } else {
                    await StockMedisModel.update(
                        {sisa_stok: 0},
                        {
                            where: {
                                uuid: stock.uuid,
                            },
                            transaction: t
                        }
                    );
                    result.push({
                        stock_medis_uuid: stock.uuid,
                        quantity: stock.sisa_stok,
                        expired_date: stock.exp_date,
                        previous_stock: stock.sisa_stok,
                    });

                    remainingQuantity = Math.abs(newStock);
                }
            }

            return result;
        } else if (req.stock_medis_uuid) {
            const stock = await StockMedisModel.findOne({
                where: {
                    uuid: req.stock_medis_uuid
                },
                include: [
                    {
                        model: ItemMedisJenisStokModel,
                        as: "item_medis_jenis_stok",
                        required: true,
                        attributes: ["uuid", "item_medis_uuid", "jenis_stok_uuid"],
                        include: [
                            {
                                model: ItemMedisModel,
                                as: 'item_medis',
                                required: true,
                                attributes: ['name'],
                            }
                        ],
                    }
                ],

            });

            if (stock.sisa_stok < req.quantity) {
                throw new BadRequestException(`${stock.dataValues.item_medis_jenis_stok?.dataValues?.item_medis?.name} not enough or empty`);
            }

            const newStock = stock.sisa_stok - req.quantity;

            const result = await StockMedisModel.update(
                {sisa_stok: newStock},
                {
                    where: {uuid: req.stock_medis_uuid},
                    transaction: t
                }
            );

            if (result[0] === 0) {
                throw new BadRequestException(`${stock.dataValues.item_medis_jenis_stok?.dataValues?.item_medis?.name}  stok medis tidak diupdate`);
            }

            return stock;
        }
    }

    static async bulkCreate(req, transaction) {
        return await StockMedisModel.bulkCreate(req, {
            transaction
        });
    }

    static async getSome(uuids) {
        const result = await StockMedisModel.findAll({
            where: {
                uuid: uuids
            },
            attributes: {
                exclude: [
                    "deleted_at",
                    "created_at",
                    "updated_at",
                ],
            },
        });

        if (!result) {
            throw new BadRequestException({message: "Data tidak ditemukan"});
        }

        return result;
    }

    static async getAllForPengeluaran(req) {
        const result = await StockMedisModel.findAll({
            where: {
                sisa_stok: {
                    [Op.gt]: 0
                },
                exp_date: {
                    [Op.gt]: new Date(req.tanggal_pengeluaran)
                },
                lokasi_stok_uuid: req.lokasi_stok_uuid,
            },
            attributes: ["exp_date", "sisa_stok", "harga_satuan"],
            include: [
                {
                    model: ItemMedisJenisStokModel,
                    as: 'item_medis_jenis_stok',
                    required: true,
                    attributes: ['uuid'],
                    include: [
                        {
                            model: JenisStokModel,
                            as: 'detail_stok',
                            required: true,
                            attributes: ['name'],
                            where: {
                                uuid: req.jenis_stok_uuid
                            }
                        },
                        {
                            model: ItemMedisModel,
                            as: 'item_medis',
                            required: true,
                            attributes: ['name', 'uuid'],
                        }
                    ],
                }
            ]
        });

        if (!result) {
            throw new BadRequestException({message: "Data tidak ditemukan"});
        }

        return result;
    }

    static async update(req, transaction) {
        const result = await StockMedisModel.update(req, {
            where: {
                uuid: req.uuid
            },
            transaction
        });

        if (result[0] === 0) {
            throw new BadRequestException("Data tidak ditemukan");
        }

        return result;
    }

    static async adjustStockForStokOpname(req, transaction) {
        const stock = await StockMedisModel.findOne({
            where: {
                uuid: req.uuid
            },
            transaction
        })

        const allRelatedStock = await StockMedisModel.findAll({
            where: {
                faskes_uuid: req.faskes_uuid,
                exp_date: stock.exp_date,
                item_medis_jenis_stok_uuid: stock.item_medis_jenis_stok_uuid,
                lokasi_stok_uuid: stock.lokasi_stok_uuid,

            }
        })

        let remainingQuantity = req.qty;
        let iteration = 0;

        for (let stockItem of allRelatedStock) {
            if (remainingQuantity === 0) {
                break;
            }

            let availableQuantity = 0;

            if (remainingQuantity > 0) {
                availableQuantity = Math.min(stockItem.stok - stockItem.sisa_stok, remainingQuantity);
                stockItem.sisa_stok += availableQuantity;
            } else {
                availableQuantity = Math.min(stockItem.sisa_stok, Math.abs(remainingQuantity));
                stockItem.sisa_stok -= availableQuantity;
            }

            remainingQuantity -= (remainingQuantity > 0 ? availableQuantity : -availableQuantity);

            await StockMedisModel.update({
                sisa_stok: stockItem.sisa_stok,
                exp_date: req.exp_date
            }, {
                where: {
                    uuid: stockItem.uuid
                },
                transaction
            })

            iteration++;
        }

        if (remainingQuantity !== 0) {
            throw new BadRequestException(`Stock untuk id stok ${req.uuid}. stok hilang/lebih : ${Math.abs(remainingQuantity)}`);
        }

        for (let i = iteration; i < allRelatedStock.length; i++) {
            await StockMedisModel.update({
                exp_date: req.exp_date
            }, {
                where: {
                    uuid: allRelatedStock[i].uuid
                },
                transaction
            })
        }
    }

    static async getForMutasi(req) {
        return await StockMedisModel.findAll({
            where: {
                lokasi_stok_uuid: req.lokasi_stok_uuids,
            },
            include: [
                {
                    model: ItemMedisJenisStokModel,
                    as: 'item_medis_jenis_stok',
                    required: true,
                    attributes: ['uuid', 'item_medis_uuid', 'jenis_stok_uuid'],
                    where: {
                        item_medis_uuid: req.item_uuids,
                        jenis_stok_uuid: req.jenis_stok_uuids
                    },
                }
            ]
        })
    }

    static async getDetail(req) {
        return await StockMedisModel.findOne({
            where: {
                uuid: req.uuid
            },
            include: [
                {
                    model: ItemMedisJenisStokModel,
                    as: 'item_medis_jenis_stok',
                    required: true,
                    include: [
                        {
                            model: ItemMedisModel,
                            as: 'item_medis',
                            required: false,
                            attributes: ['code', 'jenis_item'],
                            include: [
                                {
                                    model: SatuanModel,
                                    as: 'satuan_penggunaan',
                                    required: false,
                                    attributes: ['name']
                                },
                                {
                                    model: ManufactureModel,
                                    as: 'manufacture',
                                    required: false,
                                    attributes: ['name']
                                }
                            ]
                        },
                        {
                            model: JenisStokModel,
                            as: 'detail_stok',
                            required: false,
                            attributes: ['name'],
                        }
                    ]
                }
            ]
        });
    }

    static async getRiwayatTarif(req) {
        const option = {
            where: {
                faskes_uuid: req.faskes_uuid
            },
            attributes: ["uuid", "stok", "exp_date", "harga_satuan"],
            include: [
                {
                    model: ItemMedisJenisStokModel,
                    as: 'item_medis_jenis_stok',
                    required: true,
                    attributes: ['uuid', 'item_medis_uuid', 'jenis_stok_uuid'],
                    where: {
                        jenis_stok_uuid: {
                            [Op.iLike]: `%${req.jenis_stok_uuid ?? ""}%`
                        },
                    },
                    include: [
                        {
                            model: ItemMedisModel,
                            as: 'item_medis',
                            required: true,
                            attributes: ['name', 'jenis_item'],
                            where: {
                                [Op.or]: [
                                    {name: {[Op.iLike]: `%${req.search ?? ""}%`}},
                                    {code: {[Op.iLike]: `%${req.search ?? ""}%`}},
                                ],
                                jenis_item: {
                                    [Op.in]: req.jenis_item ? [req.jenis_item] : ['obat', 'alkes'],
                                }
                            }
                        },
                        {
                            model: JenisStokModel,
                            as: 'detail_stok',
                            required: false,
                            attributes: ['name'],
                        }
                    ]
                },
                {
                    model: ConversionModel,
                    as: 'konversi',
                    required: false,
                    attributes: ['satuan_penggunaan'],
                }
            ]
        }

        return await Pagination.init(StockMedisModel, req, option);
    }

    static async getPurchaseHistory(req) {
        return await StockMedisModel.findAll({
            where: {
                item_medis_jenis_stok_uuid: req.item_medis_jenis_stok_uuid,
            },
            attributes: ["exp_date", "harga_satuan", "created_at"],
            order: [["created_at", "DESC"]],
        })
    }
}