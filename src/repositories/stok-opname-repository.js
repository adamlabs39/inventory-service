import {Op} from "sequelize";
import {StokOpnameModel} from "@adameds/model-sdk/inventory";
import Pagination from "../helpers/pagination.js";

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
}