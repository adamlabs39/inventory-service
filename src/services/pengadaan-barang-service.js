import ZodValidator from "../validations/zod-validator.js";
import InventoryValidation from "../validations/inventory-validation.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import InternalServerException from "../errors/internal-server-exception.js";

import Utils from "../helpers/utils.js";
import { uuidv7 } from "uuidv7";
import PengadaanBarangRepository from "../repositories/pengadaan-barang-repository.js";

export default class PengadaanBarangService {
  static async orderBarang(req) {
    const transaction = await sequelizeInstance.transaction();

    // generate no prescription
    // req.no_po = Utils.generate4Code("PO");
    var noPo = Utils.generate4Code("PO");

    // ZodValidator.validate(AlkesValidation.ORDER_ALKES, req);
    // if (req.alkes === null || req.alkes === undefined) {
    //     throw new BadRequestException("'alkes' tidak boleh kosong");
    // }

    try {
      // create pembelian_barang
      let dataPembelianBarang = {
        faskes_uuid: req.faskes_uuid,
        no_po: noPo,
        kategori_item: req.kategori_item,
        jenis_stok_uuid: req.jenis_stok_uuid,
        jenis_item: req.jenis_item,
        supplier_uuid: req.supplier_uuid,
        tanggal_pembelian: req.tanggal_pembelian,
        metode_pembelian: req.metode_pembelian,
        catatan_po: req.catatan_po,
        isCito: req.is_cito,
        total_item: req.total_item,
        diskon: req.diskon ? req.diskon : 0,
        materai: req.materai ? req.materai : 0,
        ppn: req.ppn,
        grand_total: req.grand_total,
        petugas_pembuat_po: req.petugas_pembuat_po,
        petugas_pembuat_po_uuid: req.petugas_pembuat_po_uuid,
        status: "pending",
        alasan_batal: req.alasan_batal,
        lokasi_stok_uuid: req.lokasi_stok_uuid,
        tanggal_penerimaan: req.tanggal_penerimaan,
        no_faktur: req.no_faktur,
        tanggal_faktur: req.tanggal_faktur,
        catatan_penerimaan: req.catatan_penerimaan,
        petugas_pengirim: req.petugas_pengirim,
        petugas_penerima: req.petugas_penerima,
        petugas_penerima_uuid: req.petugas_penerima_uuid,
        ongkos_kirim: req.ongkos_kirim,
      };
      const order_pengadaan_barang =
        await PengadaanBarangRepository.createPembelianBarang(
          dataPembelianBarang,
          transaction
        );
      const order_pengadaan_barang_uuid =
        order_pengadaan_barang.dataValues.uuid;
      order_pengadaan_barang.dataValues.pembelian_items = [];
      // create pembeliaan item
      for (const item of req.items) {
        item.pembelian_barang_supplier_uuid = order_pengadaan_barang_uuid;
        // item.faskes_uuid = req.faskes_uuid;
        item.faskes_uuid = "0192b31f-365d-731c-8b16-3a4565c9475e";

        // ZodValidator.validate(AlkesValidation.CREATE_ALKES_ITEM, item);

        delete item.name;
        const data_pembelian_item =
          await PengadaanBarangRepository.createPembelianBarangItem(
            item,
            transaction
          );
        order_pengadaan_barang.dataValues.pembelian_items.push(
          data_pembelian_item
        );
      }

      await transaction.commit();

      return order_pengadaan_barang;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async getAll(req) {
    ZodValidator.validate(InventoryValidation.GET_FILTER, req);
    return await PengadaanBarangRepository.getAll(req);
  }

  static cancelPembelianBarang(req) {
    ZodValidator.validate(InventoryValidation.DATA_SATUAN, req);
    return PengadaanBarangRepository.update(req);
  }

  static async update(req) {
    // ZodValidator.validate(InventoryValidation.UPDATE_ITEM_MEDIS, req);
    const tr = await sequelizeInstance.transaction();

    try {
      const purchaseOrder = await PengadaanBarangRepository.updatePurchaseOrder(
        req,
        tr
      );

      if (req.items !== undefined && Array.isArray(req.items)) {
        const newItem = req.items
          .filter((item) => !item.uuid)
          .map((item) => ({
            ...item,
            pembelian_barang_supplier_uuid: req.uuid,
            faskes_uuid: req.faskes_uuid,
            uuid: uuidv7(),
          }));

        const updatedItem = req.items
          .filter((item) => item.is_updated === true)
          .map((item) => ({
            ...item,
            pembelian_barang_supplier_uuid: req.uuid,
            faskes_uuid: req.faskes_uuid,
          }));

        const deletedItem = req.items
          .filter((item) => item.is_deleted === true)
          .map((item) => ({
            ...item,
            status: false,
            pembelian_barang_supplier_uuid: req.uuid,
            faskes_uuid: req.faskes_uuid,
          }));

        if (newItem.length > 0) {
          console.log("new_item", newItem);

          await PengadaanBarangRepository.bulkCreate(newItem, tr);
        }

        if (updatedItem.length > 0) {
          await Promise.all(
            updatedItem.map((item) =>
              PengadaanBarangRepository.updatePurchaseOrderItems(item, tr)
            )
          );
        }

        if (deletedItem.length > 0) {
          await Promise.all(
            deletedItem.map((item) =>
              PengadaanBarangRepository.delete(item, tr)
            )
          );
        }
      }

      await tr.commit();
      return purchaseOrder;
    } catch (e) {
      console.log("errorss", e);

      await tr.rollback();
      throw new InternalServerException(e.message);
    }
  }
}
