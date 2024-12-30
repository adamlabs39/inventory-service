import {PermintaanUnitModel} from "@adameds/model-sdk/inventory";
import {Op} from "sequelize";
import sequelizeInstance from "@adameds/model-sdk/instance";
import {LokasiStokModel} from "@adameds/model-sdk/farmasi";
import Pagination from "../helpers/pagination.js";

export default class PermintaanUnitRepository {
    static async getAll(req) {
        const option = {
            where: {
                deleted_at: null,
                faskes_uuid: req.faskes_uuid,
                status: req.status ?? undefined,
                [Op.or]: [
                    {no_permintaan: {[Op.iLike]: `%${req.search}%`}},
                    sequelizeInstance.where(
                        sequelizeInstance.col('lokasi_stok_tujuan.name'),
                        {[Op.iLike]: `%${req.search || ''}%`}
                    )
                ]
            },
            attributes: [
                'uuid',
                'tanggal_permintaan',
                'no_permintaan',
                'kategori_item',
                'jenis_stok',
                'jenis_item',
                'petugas_permintaan',
                'petugas_verifikasi',
                'petugas_kirim',
                'petugas_batal_tolak',
                'status',
                'cito'],
            include: [
                {
                    model: LokasiStokModel,
                    as: 'lokasi_stok_tujuan',
                    required: false,
                    attributes: ['name']
                }
            ]
        }

        return await Pagination.init(PermintaanUnitModel, req, option);
    }
}
