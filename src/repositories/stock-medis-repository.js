import {Op} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import BadRequestException from "../errors/bad-request-exception.js";
import {StockMedisModel} from "@adameds/model-sdk/inventory";
import {ItemMedisModel} from "@adameds/model-sdk/farmasi";

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

            const totalStock = await StockMedisModel.sum('sisa_stok', {
                where: {
                    item_medis_uuid: req.item_medis_uuid,
                    sisa_stok: {
                        [Op.gt]: 0
                    },
                    exp_date: {
                        [Op.gt]: today
                    },
                    jenis_stok_uuid: req.jenis_stok_uuid,
                    lokasi_stok_uuid: req.lokasi_stok_uuid,
                },
                transaction: t,
            });

            if (totalStock < req.quantity) {
                throw new BadRequestException(`${req.name} not enough or empty (total stock : ${totalStock})`);
            }

            while (remainingQuantity > 0) {
                stock = await StockMedisModel.findOne({
                    where: {
                        item_medis_uuid: req.item_medis_uuid,
                        sisa_stok: {
                            [Op.gt]: 0
                        },
                        exp_date: {
                            [Op.gt]: today
                        },
                        jenis_stok_uuid: req.jenis_stok_uuid,
                        lokasi_stok_uuid: req.lokasi_stok_uuid,
                    },
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
                        model: ItemMedisModel,
                        as: 'item_medis',
                        required: true,
                        attributes: ['name'],
                    }
                ],
            });

            if (stock.sisa_stok < req.quantity) {
                throw new BadRequestException(`${stock.dataValues.item_medis?.name} not enough or empty`);
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
                throw new BadRequestException(`${stock.dataValues.item_medis?.name}  stok medis tidak diupdate`);
            }

            return stock;
        }
    }


    static async addQuantity(req, transaction) {
        await StockMedisModel.update({
            sisa_stok: sequelizeInstance.literal(`sisa_stok + ${req.quantity}`)
        }, {
            where: {
                uuid: req.stock_medis_uuid
            },
            transaction
        });
    }

    static async create(req, transaction) {
        return await StockMedisModel.create(req, {
            transaction
        });
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
                jenis_stok_uuid: req.jenis_stok_uuid,
                lokasi_stok_uuid: req.lokasi_stok_uuid,
            },
            attributes: ["exp_date", "sisa_stok", "harga_satuan"],
            include: [
                {
                    model: ItemMedisModel,
                    as: "item_medis",
                    required: true,
                    where: {
                        jenis_item: req.jenis_item,
                    },
                    attributes: ["name", "uuid"]
                },
            ]
        });

        if (!result) {
            throw new BadRequestException({message: "Data tidak ditemukan"});
        }

        return result;
    }
}