import {Op} from "sequelize";
import {StockMedisModel, StokOpnameModel} from "@adameds/model-sdk/inventory";
import Pagination from "../helpers/pagination.js";
import {ItemMedisJenisStokModel, ItemMedisModel, JenisStokModel, KategoriObatModel} from "@adameds/model-sdk/farmasi";
import BadRequestException from "../errors/bad-request-exception.js";

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

        const optionJoin = [
            {
                model: KategoriObatModel,
                required: false,
                as: 'kategori_obat',
                attributes: ['name'],

            }
        ]

        const optionWhere = {
            faskes_uuid: req.faskes_uuid,
            jenis_item: req.jenis_items,
        }

        const stockModelJoin = {
            model: StockMedisModel,
            required: false,
            as: 'stocks',
            attributes: ['sisa_stok', 'harga_satuan', 'stok', 'exp_date', 'uuid'],
            where: {
                lokasi_stok_uuid: req.lokasi_stok_uuid,
            }
        }

        if (req.type === "master_stok") {
            stockModelJoin.where.sisa_stok = {[Op.gt]: 0}
            stockModelJoin.required = true
        } else if (req.type === "master_item") {

        } else {
            throw new BadRequestException(`Tipe ${req.type} tidak ditemukan`)
        }

        optionJoin.push({
            model: ItemMedisJenisStokModel,
            required: true,
            as: 'jenis_stok',
            attributes: ['uuid'],
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
                stockModelJoin
            ]
        },)
        
        const option = {
            where: optionWhere,
            attributes: ['uuid', 'code', 'name', 'jenis_item'],
            include: optionJoin
        }

        return await ItemMedisModel.findAll(option);
    }
}