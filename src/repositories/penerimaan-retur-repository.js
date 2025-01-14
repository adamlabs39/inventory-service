import {ReturUnitItemModel, ReturUnitModel} from "@adameds/model-sdk/inventory";
import {Op} from "sequelize";
import {ItemMedisModel, LokasiStokModel, SatuanModel} from "@adameds/model-sdk/farmasi";
import sequelizeInstance from "@adameds/model-sdk/instance";
import Pagination from "../helpers/pagination.js";

export default class PenerimaanReturRepository {
    static async getAll(request) {
        const whereRetur = {
            faskes_uuid: request.faskes_uuid,
            lokasi_stok_tujuan_uuid: request.lokasi_stok_tujuan_uuid,
            [Op.or]: [
                {no_retur: {[Op.iLike]: `%${request.search || ''}%`}},
                sequelizeInstance.where(
                    sequelizeInstance.col('lokasi_stok_awal.name'),
                    {[Op.iLike]: `%${request.search || ''}%`}
                )
            ],
        };

        if (request.alasan_retur) {
            whereRetur.alasan_retur = request.alasan_retur;
        }

        const option = {
            where: whereRetur,
            attributes: ['uuid', 'tanggal_retur', 'no_retur', 'alasan_retur', 'petugas_retur', 'jenis_stok', 'kategori_item', 'jenis_item'],
            include: [
                {
                    model: LokasiStokModel,
                    as: 'lokasi_stok_awal',
                    attributes: ['name']
                }
            ],
            order: [['tanggal_retur', 'DESC']],
        }

        return await Pagination.init(ReturUnitModel, request, option);
    }

    static async getDetail(request) {
        return await ReturUnitModel.findOne({
            where: {
                uuid: request.uuid,
            },
            attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at']
            },
            include: [
                {
                    model: LokasiStokModel,
                    as: 'lokasi_stok_awal',
                    required: true,
                    attributes: ['name']
                },
                {
                    model: LokasiStokModel,
                    as: "lokasi_stok_tujuan",
                    required: true,
                    attributes: ["name"],
                },
                {
                    model: ReturUnitItemModel,
                    as: "items",
                    required: false,
                    attributes: ['uuid', 'qty', 'qty_terima'],
                    include: [
                        {
                            model: ItemMedisModel,
                            as: 'item',
                            required: false,
                            attributes: ['name'],
                            include: [
                                {
                                    model: SatuanModel,
                                    as: "satuan_penggunaan",
                                    required: false,
                                    attributes: ['name']
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    }
}