import {
  ItemMedisJenisStokModel,
  ItemMedisModel,
  JenisStokModel,
  KategoriObatModel,
  LokasiStokModel,
  SatuanModel,
} from "@adameds/model-sdk/farmasi";
import { StockMedisModel } from "@adameds/model-sdk/inventory";
import { Op } from "sequelize";
import Pagination from "../helpers/pagination.js";
import InternalServerException from "../errors/internal-server-exception.js";

export default class ItemMedisJenisStokRepository {
  static async getForKartuStok(req) {
    const { faskes_uuid, jenis_item, jenis_stok_uuid, lokasi_stok_uuid, search } = req;
    const searchQuery = search ?? "";

    const options = {
      where: {
        faskes_uuid: faskes_uuid,
      },
      attributes: ["uuid"],
      include: [
        {
          model: ItemMedisModel,
          as: "item_medis",
          required: true,
          attributes: ["uuid", "name", "jenis_item"],
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchQuery}` } },
              { code: { [Op.iLike]: `%${searchQuery}` } },
            ],
            ...(jenis_item && { jenis_item: jenis_item }),
          },
          include: [
            {
              model: KategoriObatModel,
              as: "kategori_obat",
              required: true,
              attributes: ["name"],
            },
            {
              model: SatuanModel,
              as: "satuan_kemasan",
              required: true,
              attributes: ["name"],
            },
          ],
        },
        {
          model: JenisStokModel,
          as: "detail_stok",
          required: true,
          attributes: ["uuid", "name"],
          where: { ...jenis_stok_uuid && { uuid: jenis_stok_uuid } },
        },
        {
          model: StockMedisModel,
          as: "stocks", 
          required: true,
          attributes: ["sisa_stok"],
          where: {
            sisa_stok: {
              [Op.gt]: 0,
            },
            ...(lokasi_stok_uuid && { lokasi_stok_uuid: lokasi_stok_uuid }),
          },
          include: [
            {
              model: LokasiStokModel,
              as: "lokasi_stok",
              required: false,
              attributes: ["name"],
            }
          ]
        }
      ]
    };

    return await Pagination.init(ItemMedisJenisStokModel, req, options);
  }

  static async getDetailForStokAdjustment(req) {
    return await ItemMedisJenisStokModel.findOne({
      where: {
        uuid: req.uuid,
      },
      attributes: ["uuid"],
      include: [
        {
          model: ItemMedisModel,
          as: "item_medis",
          required: true,
          attributes: ["uuid", "name", "jenis_item"],
          [Op.or]: [
            { name: { [Op.iLike]: `%${req.search}%` } },
            { code: { [Op.iLike]: `%${req.search}%` } },
          ],
          include: [
            {
              model: KategoriObatModel,
              as: "kategori_obat",
              required: true,
              attributes: ["name"],
            },
          ],
        },
        {
          model: JenisStokModel,
          as: "detail_stok",
          required: true,
          attributes: ["uuid", "name"],
        },
        {
          model: StockMedisModel,
          as: "stocks",
          required: true,
          attributes: ["uuid", "sisa_stok", "exp_date"],
          where: {
            sisa_stok: {
              [Op.gt]: 0,
            },
            lokasi_stok_uuid: req.lokasi_stok_uuid,
          },
        },
      ],
    });
  }

  static async getForStokOpname(req) {
    return await ItemMedisJenisStokModel.findAll({
      where: {
        faskes_uuid: req.faskes_uuid,
        item_medis_uuid: req.item_medis_uuids,
      },
      attributes: ["uuid"],
      include: [
        {
          model: JenisStokModel,
          as: "detail_stok",
          required: false,
          attributes: ["uuid", "name"],
          where: {
            name: req.names,
          },
        },
      ],
    });
  }

  static async getForPengadaanBarang(req) {
    return await ItemMedisJenisStokModel.findAll({
      where: {
        faskes_uuid: req.faskes_uuid,
        item_medis_uuid: req.item_medis_uuids,
        jenis_stok_uuid: req.jenis_stok_uuid,
      },
      attributes: ["uuid", "jenis_stok_uuid", "item_medis_uuid"],
    });
  }
  
  static async countValidItemsForJenisStok(itemUuids, jenisStokUuid, faskesUuid) {
    try {
      return await ItemMedisJenisStokModel.count({
        where: {
          item_medis_uuid: { [Op.in]: itemUuids },
          jenis_stok_uuid: jenisStokUuid,
          faskes_uuid: faskesUuid
        }
      });
    } catch (error) {
      throw new InternalServerException(`Gagal menghitung item valid: ${error.message}`);
    } 
  }
}
