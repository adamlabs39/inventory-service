import {Op} from "sequelize";
import {ItemMedisModel, JenisStokModel} from "@adameds/model-sdk/farmasi";
import Pagination from "../helpers/pagination.js";
import {
    RiwayatMutasiModel,
} from "@adameds/model-sdk/inventory";

export default class RiwayatMutasiRepository {
    static async getAll(req) {
        const whereRiwayat = {
            faskes_uuid: req.faskes_uuid,
            lokasi_stok_uuid: req.lokasi_stok_uuid,
            created_at: {
                [Op.between]: [req.start_date, req.end_date]
            }
        }

        if (req.jenis_stok_uuid) {
            whereRiwayat.jenis_stok_uuid = req.jenis_stok_uuid;
        }

        if (req.jenis_item) {
            whereRiwayat.jenis_item = req.jenis_item;
        }

        const option = {
            where: whereRiwayat,
            order: [['created_at', 'DESC']],
            attributes: ['code', 'sumber_mutasi', 'created_at', 'exp_date', 'stok_awal', 'petugas', 'stok_mutasi', 'keterangan'],
            include: [
                {
                    model: ItemMedisModel,
                    as: 'detail_item',
                    required: true,
                    where: {
                        [Op.or]: [
                            {name: {[Op.iLike]: `%${req.search || ''}%`}},
                            {code: {[Op.iLike]: `%${req.search || ''}%`}}
                        ]
                    },
                    attributes: ['name', 'jenis_item', 'code']
                },
                {
                    model: JenisStokModel,
                    as: 'jenis_stok',
                    required: true,
                    attributes: ['name']
                }
            ]
        }

        return await Pagination.init(RiwayatMutasiModel, req, option);
    }
}