import {Op} from "sequelize";
import BadRequestException from "../errors/bad-request-exception.js";
import {StockMedisModel} from "@adameds/model-sdk/inventory";
import {ItemMedisJenisStokModel, ItemMedisModel, JenisStokModel} from "@adameds/model-sdk/farmasi";

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
                        attributes: ["uuid"],
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

    static async update(req) {
        const result = await StockMedisModel.update(req, {
            where: {
                uuid: req.uuid
            }
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
            let availableQuantity = Math.min(stockItem.sisa_stok, Math.abs(remainingQuantity));

            if (remainingQuantity > 0) {
                stockItem.sisa_stok += availableQuantity;
            } else {
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
            throw new BadRequestException(`Stock untuk id stok ${req.uuid} tidak cukup. stok hilang : ${remainingQuantity}`);
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
}