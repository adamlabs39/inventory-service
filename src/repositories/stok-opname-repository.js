import {Op} from "sequelize";
import {StockMedisModel, StokOpnameModel} from "@adameds/model-sdk/inventory";
import Pagination from "../helpers/pagination.js";
import {ItemMedisJenisStokModel, ItemMedisModel, JenisStokModel} from "@adameds/model-sdk/farmasi";

export default class StokOpnameRepository {
    static async getAll(req) {
        const option = {
            where: {
                faskes_uuid: req.faskes_uuid,
                lokasi_stok_uuid: req.lokasi_stok_uuid,
                [Op.or]: [
                    {no_stok_opname: {[Op.iLike]: `%${req.search || ''}%`}},
                    {judul_stok_opname: {[Op.iLike]: `%${req.search || ''}%`}},
                ],
            },
            order: [['tanggal_cut_off', 'DESC']],
            attributes: [
                'uuid',
                'tanggal_cut_off',
                'no_stok_opname',
                'kategori_item',
                'jenis_items',
                'jenis_stoks',
                'judul_stok_opname',
                'petugas_so',
                'petugas_pengubah',
                'status',
            ],
        }

        return await Pagination.init(StokOpnameModel, req, option);
    }

    static async getStockCard(req) {
        return await ItemMedisModel.findAll({
            where: {
                faskes_uuid: req.faskes_uuid,
                jenis_item: req.jenis_items,
            },
            attributes: ['uuid', 'code', 'name'],
            include: [
                {
                    model: ItemMedisJenisStokModel,
                    required: false,
                    as: 'jenis_stok',
                    attributes: ['name'],
                    include: [
                        {
                            model: JenisStokModel,
                            required: true,
                            as: 'detail_stok',
                            attributes: ['name', 'uuid'],
                            where: {
                                uuid: req.jenis_stok_uuids
                            },
                        },
                        {
                            model: StockMedisModel,
                            required: false,
                            as: 'stocks',
                            attributes: ['sisa_stok', 'harga_satuan', 'stok', 'stok'],
                            where: {
                                lokasi_stok_uuid: req.lokasi_stok_uuid,
                                sisa_stok: {[Op.gt]: 0}
                            }
                        }
                    ]
                }
            ]
        })
    }
}