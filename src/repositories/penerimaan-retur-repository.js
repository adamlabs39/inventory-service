import {ReturUnitItemModel, ReturUnitModel} from "@adameds/model-sdk/inventory";
import {Op} from "sequelize";
import {ItemMedisModel, LokasiStokModel, SatuanModel} from "@adameds/model-sdk/farmasi";
import Pagination from "../helpers/pagination.js";

export default class PenerimaanReturRepository {
    static async getAll(request) {
        const { faskes_uuid, search = "", alasan_retur } = request;

        const options = {
            where: {
                faskes_uuid: faskes_uuid,
                [Op.or]: [
                    { no_retur: { [Op.iLike]: `${search}` } },
                    { "$lokasi_stok_awal.name$": { [Op.iLike]: `%${search}%` } }
                ],

                ...(alasan_retur && { alasan_retur: alasan_retur })
            },

            attributes: [
                "uuid", "tanggal_retur", "no_retur", "alasan_retur", 
                "petugas_retur", "jenis_stok", "kategori_item", "jenis_item"
            ],

            include: [
                {
                    model: LokasiStokModel,
                    as: "lokasi_stok_awal",
                    attributes: ["name"]
                }
            ],

            order: [["tanggal_retur", "DESC"]],
        };

        return await Pagination.init(ReturUnitModel, request, options);
    }

    static async getDetail(request) {
        return await ReturUnitModel.findOne({
            where: {
                uuid: request.uuid,
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"]
            },
            include: [
                {
                    model: LokasiStokModel,
                    as: "lokasi_stok_awal",
                    required: true,
                    attributes: ["name"]
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
                    attributes: ["uuid", "qty", "qty_terima"],
                    include: [
                        {
                            model: ItemMedisModel,
                            as: "item",
                            required: false,
                            attributes: ["name"],
                            include: [
                                {
                                    model: SatuanModel,
                                    as: "satuan_penggunaan",
                                    required: false,
                                    attributes: ["name"]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }
}