import sequelizeInstance from "../configurations/sequelize-instance.js";
import {Op} from "sequelize";
import Utils from "../helpers/utils.js";
import InternalServerException from "../errors/internal-server-exception.js";
import {LokasiModel} from "@adameds/model-sdk/datamaster";
import {
    ItemMedisModel, JenisStokModel, LokasiStokModel, OrderAlkesItemModel,
    OrderAlkesModel,
    PrescriptionItemModel, PrescriptionModel,
    SatuanModel
} from "@adameds/model-sdk/farmasi";
import {PatientModel} from "@adameds/model-sdk/admisi";
import Pagination from "../helpers/pagination.js";

export default class AlkesRepository {
    // get prescription by uuid
    static async getByUuid(uuid) {
        return await OrderAlkesModel.findOne(
            {
                where: {
                    uuid: uuid
                },
                attributes : {
                  exclude: ['deleted_at', 'created_at', 'updated_at', 'faskes_uuid']
                },
                include : [
                    {
                        model : OrderAlkesItemModel,
                        as : 'alkes_items',
                        required : false,
                        attributes : {
                            exclude: ['deleted_at', 'created_at', 'updated_at', 'faskes_uuid']
                        },
                        include : [
                            {
                                model : ItemMedisModel,
                                as : 'item_medis',
                                required: false,
                                attributes : ['name', 'uuid'],
                                include : [
                                    {
                                        model : SatuanModel,
                                        as : 'satuan_penggunaan',
                                        required: false,
                                        attributes : ['name']
                                    }
                                ]
                            },
                            {
                                model : JenisStokModel,
                                as : 'jenis_stok',
                                required: false,
                                attributes : ['name', 'uuid']
                            }
                        ]
                    }
                ]
            }
        );
    }

    // create prescription
    static async createAlkes(req, transaction) {
        return await OrderAlkesModel.create(req, {transaction});
    }

    // create prescription item
    static async createAlkesItem(req, transaction) {
        return await OrderAlkesItemModel.create(req, {transaction});
    }

    // get all prescription
    static async getAllAlkes(req) {
        req.search = Utils.nullToType(req.search)
        req.lokasi_stok_uuid = Utils.nullToType(req.lokasi_stok_uuid)
        req.jenis_pelayanan = Utils.nullToType(req.jenis_pelayanan)
        req.racikan = Utils.nullToType(req.racikan)
        req.takeaway = Utils.nullToType(req.takeaway)
        req.is_chronic = Utils.nullToType(req.is_chronic)

        req.start_date = Utils.numberTo13Digit(req.start_date)
        req.end_date = Utils.numberTo13Digit(req.end_date)

        let wherePrescription =  {
            faskes_uuid: req.faskes_uuid,
                [Op.or]: [
                { no_resep: { [Op.iLike]: `%${req.search}%` } },
                { no_rm: { [Op.iLike]: `%${req.search}%` } }
            ],
                lokasi_stok_uuid : { [Op.like]: `%${req.lokasi_stok_uuid}%` },
            order_date : {
                [Op.between]: [req.start_date, req.end_date]
            },
            order_status : {
                [Op.between]: [1, 4]
            }
        }

        if (req.jenis_pelayanan !== ""){
            wherePrescription.jenis_pelayanan = req.jenis_pelayanan
        }

        if(req.takeaway !== ""){
            wherePrescription.is_takeaway = true
        }

        let wherePrescriptionItem = {}

        if (req.racikan !== ""){
            wherePrescriptionItem.is_compound = true
        }

        if (req.is_chronic !== "") {
            wherePrescriptionItem.is_chronic = true
        }

        return await PrescriptionModel.findAll(
            {
                where : wherePrescription,
                attributes : ['uuid','no_rm', 'no_reg' ,'no_resep', 'dokter_order', 'jenis_pelayanan', 'order_date', 'is_takeaway', 'order_status'],
                include : [
                    {
                        model: PrescriptionItemModel,
                        as: 'obat',
                        required : (req.is_chronic === true) || (req.racikan === true),
                        attributes : ["is_chronic", "is_compound"],
                        where : wherePrescriptionItem,
                    }
                ]
            },
        );
    }

    // get all prescription item
    static async getAllAlkesItem(alkes_uuid) {
        return await PrescriptionItemModel.findAll(
            {
                where: {
                    prescription_uuid: alkes_uuid
                }
            }
        );
    }

    // delete alkes item
    static async deleteAlkesItem(alkes_item_uuid) {
        return await sequelizeInstance.transaction(async (tr) => {
            return await OrderAlkesItemModel.destroy(
                {
                    where: {
                        uuid: alkes_item_uuid
                    },
                    transaction: tr
                });
        });
    }

    // edit alkes
    static async editAlkes(req, transaction) {
        const affectedRow = await OrderAlkesModel.update(
            req,
            {
                where: {
                    uuid: req.uuid
                },
                transaction: transaction
            }
        );

        if(affectedRow[0] === 0){
            throw new InternalServerException("Tidak ada data yang diubah");
        }

        return affectedRow;
    }

    // edit alkes item
    static async editAlkesItem(req, transaction) {
        if (!transaction){
            transaction = await sequelizeInstance.transaction();
        }

        const affectedRow = await OrderAlkesItemModel.update(
            req,
            {
                where: {
                    uuid: req.uuid
                },
                transaction: transaction
            }
        );

        if(affectedRow[0] === 0){
            throw new InternalServerException("Tidak ada data yang diubah");
        }

        return affectedRow;
    }

    static async getOrderBySomeUuid(req){
        return await OrderAlkesModel.findAll({
            where: {
                rekam_medis_uuid : req.rekam_medis_uuid,
                rekam_medis_date : req.rekam_medis_date
            },
            attributes : ['uuid', "order_status", 'no_order_alkes', 'petugas_order', 'created_at'],
            include: [
                {
                    model: OrderAlkesItemModel,
                    as: 'alkes_items',
                    required: false,
                },
                {
                    model : LokasiStokModel,
                    as : 'lokasi_stok',
                    required: false,
                    attributes : ["name"]
                }
            ],
        });
    }

    static async getAllForFarmacy(req){
        req.search = Utils.nullToType(req.search)
        req.lokasi_stok_uuid = Utils.nullToType(req.lokasi_stok_uuid)
        req.status = Utils.nullToType(req.status, Array)
        req.payment_method = Utils.nullToType(req.payment_method, Number)

        req.start_date = Utils.numberTo13Digit(req.start_date)
        req.end_date = Utils.numberTo13Digit(req.end_date)

        const option = {
            where: {
                order_status : {
                    [Op.between]: (req.status.length > 0) ? req.status : [1, 2, 3],
                },
                faskes_uuid : req.faskes_uuid,
                [Op.or]: [
                    { no_order_alkes: { [Op.iLike]: `%${req.search}%` } },
                    { no_rm: { [Op.iLike]: `%${req.search}%` } },
                    sequelizeInstance.where(
                        sequelizeInstance.col('patient.name'),
                        {[Op.iLike]: `%${req.search || ''}%`}
                    )
                ],
                created_at : {
                    [Op.between]: [req.start_date, req.end_date]
                },
                lokasi_stok_uuid : { [Op.like]: `%${req.lokasi_stok_uuid}%` },
            },
            attributes : [
                'uuid',
                'no_order_alkes',
                'order_status',
                'petugas_order',
                'created_at',
                "no_reg",
                "no_rm",
                "jenis_pelayanan",
                "payment_method"
            ],
            include: [
                {
                    model : LokasiModel,
                    as : 'lokasi',
                    required : false,
                },
                {
                    model : PatientModel,
                    as : 'patient',
                    required : false,
                    attributes : ['name']
                },
                {
                    model : LokasiStokModel,
                    as : 'lokasi_stok',
                    required: false,
                    attributes: ["name"]
                }
            ],
        };

        if (req.payment_method !== 0) {
            option.where.payment_method = req.payment_method;
        }

        if (!req.pagination){
            return await OrderAlkesModel.findAll(option);
        } else {
            return await Pagination.init(OrderAlkesModel, req, option);
        }
    }
}