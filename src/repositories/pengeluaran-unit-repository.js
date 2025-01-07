import {PengeluaranUnitItemModel, PengeluaranUnitModel, StockMedisModel} from "@adameds/model-sdk/inventory";
import {ConversionModel, ItemMedisModel, JenisStokModel, LokasiStokModel} from "@adameds/model-sdk/farmasi";
import {Op} from "sequelize";
import Pagination from "../helpers/pagination.js";


export default class PengeluaranUnitRepository {
    static async create(req, transaction) {
        return await PengeluaranUnitModel.create(req, {transaction});
    }

    static async getAll(req) {
        const option = {
            where: {
                deleted_at: null,
                faskes_uuid: req.faskes_uuid,
                lokasi_stok_awal_uuid: req.lokasi_stok_uuid,
                no_pengeluaran: {
                    [Op.iLike]: `%${req.search || ''}%`
                },
            },
            order: [["tanggal_pengeluaran", "DESC"]],
            attributes: {
                exclude: ['deleted_at', 'created_at', 'updated_at', 'id']
            },
            include: [
                {
                    model: LokasiStokModel,
                    as: 'lokasi_stok_akhir',
                    required: false,
                    attributes: ['name']
                },
                {
                    model: JenisStokModel,
                    as: 'jenis_stok',
                    required: false,
                    attributes: ['name']
                }
            ]
        }

        return await Pagination.init(PengeluaranUnitModel, req, option);
    }

    static async getDetail(uuid) {
        return await PengeluaranUnitModel.findOne({
            where: {
                uuid: uuid
            },
            include: [
                {
                    model: LokasiStokModel,
                    as: 'lokasi_stok_akhir',
                    required: false,
                    attributes: ['name']
                },
                {
                    model: JenisStokModel,
                    as: 'jenis_stok',
                    required: false,
                    attributes: ['name']
                },
                {
                    model: PengeluaranUnitItemModel,
                    as: 'items',
                    required: false,
                    include: [
                        {
                            model: StockMedisModel,
                            as: 'stok',
                            required: false,
                            attributes: [],
                            include: [
                                {
                                    model: ItemMedisModel,
                                    as: 'item_medis',
                                    required: false,
                                    attributes: ['name'],
                                }
                            ]
                        },
                        {
                            model: ConversionModel,
                            as: 'konversi',
                            required: false,
                            attributes: ['konversi', 'satuan_penggunaan'],
                        }
                    ]
                }

            ]
        });
    }
}