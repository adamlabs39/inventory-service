import {
    ItemMedisJenisStokModel,
    ItemMedisModel,
    JenisStokModel,
    KategoriObatModel,
    LokasiStokModel
} from "@adameds/model-sdk/farmasi";
import {StockMedisModel} from "@adameds/model-sdk/inventory";
import {Op} from "sequelize";
import Pagination from "../helpers/pagination.js";

export default class ItemMedisJenisStokRepository {
    static async getForKartuStok(req) {
        const whereItemMedis = {};
        const whereJenisStok = {};
        const whereLokasiStok = {
            sisa_stok: {
                [Op.gt]: 0
            },
        };

        if (req.jenis_item) {
            whereItemMedis.jenis_item = req.jenis_item;
        }

        if (req.jenis_stok_uuid) {
            whereJenisStok.uuid = req.jenis_stok_uuid;
        }

        if (req.lokasi_stok_uuid) {
            whereLokasiStok.lokasi_stok_uuid = req.lokasi_stok_uuid;
        }

        const option = {
            where: {
                faskes_uuid: req.faskes_uuid,
            },
            attributes: ['uuid'],
            include: [
                {
                    model: ItemMedisModel,
                    as: 'item_medis',
                    required: true,
                    attributes: ['uuid', 'name', 'jenis_item'],
                    where: whereItemMedis,
                    [Op.or]: [
                        {name: {[Op.iLike]: `%${req.search}%`}},
                        {code: {[Op.iLike]: `%${req.search}%`}},
                    ],
                    include: [
                        {
                            model: KategoriObatModel,
                            as: 'kategori_obat',
                            required: true,
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: JenisStokModel,
                    as: 'detail_stok',
                    required: true,
                    attributes: ['uuid', 'name'],
                    where: whereJenisStok
                },
                {
                    model: StockMedisModel,
                    as: 'stocks',
                    required: true,
                    attributes: ['sisa_stok'],
                    where: whereLokasiStok,
                    include: [
                        {
                            model: LokasiStokModel,
                            as: 'lokasi_stok',
                            required: false,
                            attributes: ['name'],
                        }
                    ]
                }
            ]
        };

        return await Pagination.init(ItemMedisJenisStokModel, req, option);
    }

    static async getDetailForStokAdjustment(req) {
        return await ItemMedisJenisStokModel.findOne({
            where: {
                uuid: req.uuid
            },
            attributes: ['uuid'],
            include: [
                {
                    model: ItemMedisModel,
                    as: 'item_medis',
                    required: true,
                    attributes: ['uuid', 'name', 'jenis_item'],
                    [Op.or]: [
                        {name: {[Op.iLike]: `%${req.search}%`}},
                        {code: {[Op.iLike]: `%${req.search}%`}},
                    ],
                    include: [
                        {
                            model: KategoriObatModel,
                            as: 'kategori_obat',
                            required: true,
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: JenisStokModel,
                    as: 'detail_stok',
                    required: true,
                    attributes: ['uuid', 'name'],
                },
                {
                    model: StockMedisModel,
                    as: 'stocks',
                    required: true,
                    attributes: ['uuid', 'sisa_stok', 'exp_date'],
                    where: {
                        sisa_stok: {
                            [Op.gt]: 0
                        },
                        lokasi_stok_uuid: req.lokasi_stok_uuid,
                    }
                }
            ]
        });
    }

    static async getForStokOpname(req) {
        return await ItemMedisJenisStokModel.findAll({
            where: {
                faskes_uuid: req.faskes_uuid,
                item_medis_uuid: req.item_medis_uuids,
            },
            attributes: ['uuid'],
            include: [
                {
                    model: JenisStokModel,
                    as: 'detail_stok',
                    required: false,
                    attributes: ['uuid', 'name'],
                    where: {
                        name: req.names
                    }
                },
            ]
        })
    }

    static async getForPengadaanBarang(req) {
        return await ItemMedisJenisStokModel.findAll({
            where: {
                faskes_uuid: req.faskes_uuid,
                item_medis_uuid: req.item_medis_uuids,
                jenis_stok_uuid: req.jenis_stok_uuid,
            },
            attributes: ['uuid', 'jenis_stok_uuid', 'item_medis_uuid'],
        })
    }
}