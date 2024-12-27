import Pagination from "../helpers/pagination.js";
import { Op } from "sequelize";
import { toEpochDate } from "../helpers/date-helper.js";
import {
  KabupatenModel,
  KecamatanModel,
  KelurahanModel,
  ProvinceModel,
} from "@adameds/model-sdk/datamaster";
import {
  MasterSupplierModel,
  MasterSupplierKategoriItemModel,
} from "@adameds/model-sdk/inventory";

MasterSupplierModel.belongsTo(ProvinceModel, {
  foreignKey: "provinsi_code",
  targetKey: "code",
  as: "province",
  constraints: false,
});

MasterSupplierModel.belongsTo(KabupatenModel, {
  foreignKey: "kabupaten_code",
  targetKey: "code",
  as: "kabupaten",
  constraints: false,
});

MasterSupplierModel.belongsTo(KecamatanModel, {
  foreignKey: "kecamatan_code",
  targetKey: "code",
  as: "kecamatan",
  constraints: false,
});

MasterSupplierModel.belongsTo(KelurahanModel, {
  foreignKey: "kelurahan_code",
  targetKey: "code",
  as: "kelurahan",
  constraints: false,
});

export default class DatamasterSupplierRepository {
  static async create(req, transaction) {
    return await MasterSupplierModel.create(req, {transaction});
  }

  // create prescription item
  static async createSupplierItem(req, transaction) {
    return await MasterSupplierKategoriItemModel.create(req, { transaction });
  }

  static async getAll(req) {
    const option = {
      where: {
        faskes_uuid: req.faskes_uuid,
        name: { [Op.iLike]: `%${req.name || ""}%` },
        deleted_at: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: ProvinceModel,
          as: "province",
          required: false,
          attributes: ["code", "name"],
        },
        {
          model: KabupatenModel,
          as: "kabupaten",
          required: false,
          attributes: ["code", "name"],
        },
        {
          model: KecamatanModel,
          as: "kecamatan",
          required: false,
          attributes: ["code", "name"],
        },
        {
          model: KelurahanModel,
          as: "kelurahan",
          required: false,
          attributes: ["code", "name"],
        },
      ],
    };

    return Pagination.init(MasterSupplierModel, req, option);
  }

  static async getAllWithoutPagination(req) {
    return await MasterSupplierModel.findAll({
      where: {
        faskes_uuid: req.faskes_uuid,
        status: true,
      },
    });
  }

  static async getCode(code) {
    return await MasterSupplierModel.findOne({
      where: {
        code: code,
        deleted_at: {
          [Op.is]: null,
        },
      },
      attributes: ["code"],
    });
  }

  static async update(req) {
    return await MasterSupplierModel.update(req, {
      where: {
        uuid: req.uuid,
      },
    });
  }

  static async delete(req) {
    return await MasterSupplierModel.update(
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
