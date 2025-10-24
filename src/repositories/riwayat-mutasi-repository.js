import {Op} from "sequelize";
import {ItemMedisModel, JenisStokModel} from "@adameds/model-sdk/farmasi";
import Pagination from "../helpers/pagination.js";
import {
    RiwayatMutasiModel,
} from "@adameds/model-sdk/inventory";

export default class RiwayatMutasiRepository {
    static async getAll(req) {
        const { faskes_uuid, lokasi_stok_uuid, code, start_date, end_date, jenis_stok_uuid, jenis_item, search = "" } = req;
        const whereRiwayat = {
            faskes_uuid: faskes_uuid,
            ...(lokasi_stok_uuid && { lokasi_stok_uuid: lokasi_stok_uuid }),
            ...(code && { code: code }),
            ...(start_date && end_date && { 
                created_at: { [Op.between]: [start_date, end_date] } 
            }),
            ...(jenis_stok_uuid && { jenis_stok_uuid: jenis_stok_uuid })
        };

        const whereItemMedis = {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}` } },
                { code: { [Op.iLike]: `%${search}%` } }
            ],
            ...(jenis_item && { jenis_item: jenis_item })
        };

        const options = {
            where: whereRiwayat,
            order: [["created_at", "DESC"]],
            attributes: [
                "code", "sumber_mutasi", "created_at", "exp_date", "stok_awal", "petugas", "stok_mutasi", "keterangan", "item_uuid"
            ],
            include: [
                {
                    model: ItemMedisModel,
                    as: "detail_item",
                    required: true,
                    where: whereItemMedis,
                    attributes: ["name", "jenis_item", "code"],
                },
                {
                    model: JenisStokModel,
                    as: "jenis_stok",
                    required: true,
                    attributes: ["name"],
                }
            ]
        };

        return await Pagination.init(RiwayatMutasiModel, req, options);
    }

    static async create(req, options = {}) {
        await RiwayatMutasiModel.bulkCreate(req, options);
    }
}