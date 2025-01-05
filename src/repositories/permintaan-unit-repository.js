import {PermintaanUnitItemModel, PermintaanUnitModel} from "@adameds/model-sdk/inventory";
import {Op} from "sequelize";
import sequelizeInstance from "@adameds/model-sdk/instance";
import {ConversionModel, ItemMedisModel, LokasiStokModel} from "@adameds/model-sdk/farmasi";
import Pagination from "../helpers/pagination.js";
import BadRequestException from "../errors/bad-request-exception.js";

export default class PermintaanUnitRepository {
    static async getAll(req) {
        const option = {
            where: {
                deleted_at: null,
                faskes_uuid: req.faskes_uuid,
                status: {[Op.in]: req.status},
                [Op.or]: [
                    {no_permintaan: {[Op.iLike]: `%${req.search}%`}},
                    sequelizeInstance.where(
                        sequelizeInstance.col('lokasi_stok_tujuan.name'),
                        {[Op.iLike]: `%${req.search || ''}%`}
                    )
                ],
                lokasi_stok_awal_uuid : req.lokasi_gudang_uuid,
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

    static async getDetail(req){
        const result = await PermintaanUnitModel.findOne({
            where: {
                uuid: req.uuid,
                deleted_at: null,
            },
            attributes : {
                exclude: ['deleted_at', 'created_at', 'updated_at', 'faskes_uuid']
            },
            include: [
                {
                    model: LokasiStokModel,
                    as: 'lokasi_stok_tujuan',
                    required: false,
                    attributes: ['name']
                },
                {
                    model : PermintaanUnitItemModel,
                    as : 'items',
                    required : false,
                    include : [
                        {
                            model : ItemMedisModel,
                            as : 'item_medis',
                            required : false,
                            attributes: ['name']
                        },
                        {
                            model : ConversionModel,
                            as : 'konversi',
                            required : false,
                            attributes : ['konversi', 'satuan_pembelian', 'satuan_penggunaan'],
                        }
                    ]
                }
            ]
        })

        if (!result) {
            throw new BadRequestException({message: "Data tidak ditemukan"});
        }

        return result;
    }

    static async update(req, transaction){
        if (!transaction) {
            transaction = await sequelizeInstance.transaction();
        }

        return await PermintaanUnitModel.update(
            req,
            {
                where: {
                    uuid: req.uuid
                },
                transaction
            }
        )
    }

    static async create(req, transaction){
        if (!transaction) {
            transaction = await sequelizeInstance.transaction();
        }

        return await PermintaanUnitModel.create(
            req,
            {
                transaction
            }
        )
    }
}
