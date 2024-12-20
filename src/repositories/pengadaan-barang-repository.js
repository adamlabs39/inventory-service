import Pagination from "../helpers/pagination.js";
import { Op } from "sequelize";
import { toEpochDate } from "../helpers/date-helper.js";
import {
  PembelianBarangSupplierModel,
  PembelianBarangSupplierItemModel,
  MasterSupplierModel,
} from "@adameds/model-sdk/inventory";
import { ConversionModel } from "@adameds/model-sdk/farmasi";

PembelianBarangSupplierModel.hasMany(PembelianBarangSupplierItemModel, {
  foreignKey: "pembelian_barang_supplier_uuid",
  as: "pbsu",
  constraints: false,
});
PembelianBarangSupplierModel.belongsTo(MasterSupplierModel, {
  foreignKey: "supplier_uuid",
  as: "spplr",
  constraints: false,
});

PembelianBarangSupplierItemModel.belongsTo(ConversionModel, {
  foreignKey: "konversi_uuid",
  as: "cnvrsn",
  constraints: false,
});

export default class PengadaanBarangRepository {
  static async createPembelianBarang(req, transaction) {
    return await PembelianBarangSupplierModel.create(req, { transaction });
  }

  // create prescription item
  static async createPembelianBarangItem(req, transaction) {
    return await PembelianBarangSupplierItemModel.create(req, { transaction });
  }

  static async create(req) {
    return await PembelianBarangSupplierModel.create({
      code: req.code,
      name: req.name,
      status: req.status,
    });
  }

  static async getAll(req) {
    const option = {
      where: {
        no_po: { [Op.iLike]: `%${req.no_po || ""}%` },
        status: req.filter,
        deleted_at: {
          [Op.is]: null,
        },
      },
      attributes: {
        exclude: [
          "deleted_at",
          "created_at",
          "updated_at",
          "faskes_uuid",
          "no_surat_jalan",
        ],
      },
      include: [
        {
          model: PembelianBarangSupplierItemModel,
          as: "pbsu",
          required: false,
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at", "faskes_uuid"],
          },
          include: [
            {
              model: ConversionModel,
              as: "cnvrsn",
              required: false,
              attributes: {
                exclude: [
                  "deleted_at",
                  "created_at",
                  "updated_at",
                  "faskes_uuid",
                ],
              },
            },
          ],
        },
        {
          model: MasterSupplierModel,
          as: "spplr",
          required: false,
          attributes: {
            exclude: ["deleted_at", "created_at", "updated_at", "faskes_uuid"],
          },
        },
      ],
    };

    return Pagination.init(PembelianBarangSupplierModel, req, option);
  }

  static async bulkCreate(req, transaction) {
    return await PembelianBarangSupplierItemModel.bulkCreate(req, {
      transaction,
    });
  }

  static async update(req) {
    return await PembelianBarangSupplierModel.update(
      {
        status: "cancel",
        alasan_batal: req.alasan_batal,
      },
      {
        where: {
          uuid: req.uuid,
        },
      }
    );
  }

  static async updatePurchaseOrder(req, transaction) {
    return await PembelianBarangSupplierModel.update(req, {
      where: {
        uuid: req.uuid,
      },
      transaction,
    });
  }

  static async updatePurchaseOrderItems(req, transaction) {
    return await PembelianBarangSupplierItemModel.update(req, {
      where: {
        uuid: req.uuid,
      },
      transaction,
    });
  }

  static async delete(req) {
    return await PembelianBarangSupplierModel.update(
      {
        deleted_at: toEpochDate(new Date()),
      },
      {
        where: {
          uuid: req.uuid,
        },
      }
    );
  }
}
