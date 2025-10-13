import sequelizeInstance from "../configurations/sequelize-instance.js";
import BadRequestException from "../errors/bad-request-exception.js";
import Utils from "../helpers/utils.js";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";
import SettingRepository from "../repositories/setting-repository.js";
import PengadaanValidation from "../validations/pengadaan-validation.js";

export default class PengadaanBarangService {
  static async create(payload) {
    const validatedData = await PengadaanValidation.CREATE_PEMBELIAN_BARANG.parseAsync(payload);

    const transaction = await sequelizeInstance.transaction();
    try {
      let ppnRate = 0;

      if (validatedData.ppn === true) {
        ppnRate = await SettingRepository.getCurrentPpnRate();
      }

      const subTotal = validatedData.items.reduce(
            (acc, item) => acc + (item.qty_order * item.harga_satuan), 0 
          );

      const dasarPengenaanPajak = subTotal - (validatedData.diskon ?? 0);
      const totalPpn = dasarPengenaanPajak * (ppnRate / 100);
      const grandTotal = dasarPengenaanPajak + totalPpn + (validatedData.materai ?? 0);

      const dataPembelianBarang = {
        ...validatedData,
        no_po: Utils.generate4Code("PO"),
        total_item: validatedData.items.length,
        grand_total: grandTotal,
        ppn: ppnRate,
        status: "pending",
        isCito: validatedData.is_cito,
      };
      delete dataPembelianBarang.is_cito;
      const po = await InventoryBarangRepository.createPembelianBarang(dataPembelianBarang, transaction,)

      if (validatedData.items && validatedData.items.length > 0) {
        const itemsToCreate = validatedData.items.map(item => ({
          ...item,
          pembelian_barang_supplier_uuid: po.uuid,
          faskes_uuid: validatedData.faskes_uuid,
          total_harga: item.qty_order * item.harga_satuan,
        }));
        const createdItems = await InventoryBarangRepository.bulkCreate(itemsToCreate, transaction);
        po.dataValues.items = createdItems;
      } else {
        po.dataValues.items = [];
      }

      await transaction.commit();
      return po;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async getAll(options) {
    const validatedData = await PengadaanValidation.GET_ALL_PEMBELIAN_BARANG.parseAsync(options);
    const result = await InventoryBarangRepository.getAll(validatedData);

    result.data = result.data.map((pembelian) => {
      return {
          uuid: pembelian.uuid,
          no_po: pembelian.no_po,
          status: pembelian.status,
          jenis_item: pembelian.jenis_item,
          kategori_item: pembelian.kategori_item,
          tanggal_pembelian: pembelian.tanggal_pembelian,
          petugas_pembuat_po: pembelian.petugas_pembuat_po,
          petugas_penerima: pembelian.petugas_penerima,
          supplier: pembelian.spplr?.name, 
          jenis_stok: pembelian.jenis_stok?.name 
      };
    });

    return result;
  }

  static async getDetail(payload) {
    const validatedPayload = await PengadaanValidation.GET_PEMBELIAN_BARANG_BY_UUID.parseAsync(payload);
    const result = await InventoryBarangRepository.getDetail(validatedPayload);

    return {
      uuid: result.uuid,
      jenis_stok_uuid: result.jenis_stok_uuid ?? "",
      supplier_uuid: result.supplier_uuid ?? "",
      lokasi_stok_uuid: result.lokasi_stok_uuid ?? "",
      no_pembelian: result.no_po ?? "",
      tanggal_pembelian: result.tanggal_pembelian ?? 0,
      supplier: result.spplr?.name ?? "",
      lokasi: result.lks?.name ?? "",
      jenis_item: result.jenis_item ?? "",
      payment_method: result.metode_pembelian ?? "",
      kategori_item: result.kategori_item ?? "",
      cito: !!result.isCito,
      jenis_stok: result.jenis_stok?.name ?? "",
      tanggal_penerimaan: result.tanggal_penerimaan ?? "",
      no_faktur: result.no_faktur ?? "",
      tanggal_faktur: result.tanggal_faktur ?? "",
      catatan_po: result.catatan_po ?? "",
      catatan_penerimaan: result.catatan_penerimaan ?? "",
      no_surat_jalan: result.no_surat_jalan ?? "",
      items:
        result.pbsu?.map((item) => ({
          uuid: item.uuid,
          total_harga: item.total_harga ?? 0,
          harga_satuan: item.harga_satuan ?? 0,
          qty_order: item.qty_order ?? 0,
          satuan_beli: `${item.cnvrsn?.satuan_pembelian ?? "-"}/${
            item.cnvrsn?.konversi ?? ""
          } ${item.cnvrsn?.satuan_penggunaan ?? "-"}`,
          nama: item.item_medis?.name ?? "",
          item_uuid: item.item_uuid ?? "",
          conversion_uuid: item.konversi_uuid ?? "",
          satuan_beli_uuid: item.cnvrsn?.satuan_pembelian_uuid ?? "",
        })) ?? [],
      status: result.status,
      total_item: result.total_item ?? 0,
      diskon: result.diskon ?? 0,
      materai: result.materai ?? 0,
      ppn: result.ppn ?? 0,
      grand_total: result.grand_total ?? 0,
      ongkos_kirim: result.ongkos_kirim ?? 0,
      petugas_pembuat_po: result.petugas_pembuat_po ?? "-",
      petugas_penerima: result.petugas_penerima ?? "-",
      petugas_pengirim: result.petugas_pengirim ?? "-",
    };
  }

  static async cancelPembelianBarang(payload) {
    const validatedPayload = await PengadaanValidation.CANCEL_PEMBELIAN_BARANG.parseAsync(payload);
    const purchaseOrder = await InventoryBarangRepository.getDetail({
        uuid: validatedPayload.uuid,
        faskes_uuid: validatedPayload.faskes_uuid,
    });

    if (purchaseOrder.status !== 'pending') {
      throw new BadRequestException([
        {
          field: "status",
          message: `Hanya PO dengan status pending yang dapat diubah. Status saat ini: ${purchaseOrder.status}`
        }
      ])
    }
    return await InventoryBarangRepository.update(validatedPayload);
  }

  static async update(payload) {
    const validatedData = await PengadaanValidation.UPDATE_PEMBELIAN_BARANG.parseAsync(payload);

    const purchaseOrder = await InventoryBarangRepository.getDetail({
      uuid: validatedData.uuid,
      faskes_uuid: validatedData.faskes_uuid,
    });

    if (purchaseOrder.status !== 'pending') {
      throw new BadRequestException([
        {
          field: "status",
          message: `Hanya PO dengan status pending yang dapat diubah. Status saat ini: ${purchaseOrder.status}`
        }
      ])
    }

    const transaction = await sequelizeInstance.transaction();
    try {
      let ppnRate = 0;
      
      if (validatedData.ppn === true) {
        ppnRate = await SettingRepository.getCurrentPpnRate(); 
      }

      const subTotal = validatedData.items.reduce(
        (acc, item) => acc + (item.qty_order * item.harga_satuan), 0
      );

      const dasarPengenaanPajak = subTotal - (validatedData.diskon ?? 0);
      const totalPpn = dasarPengenaanPajak * (ppnRate / 100);
      const grandTotal = dasarPengenaanPajak + totalPpn + (validatedData.materai ?? 0);

      const dataToUpdate = {
        uuid: validatedData.uuid,
        faskes_uuid: validatedData.faskes_uuid,
        jenis_stok_uuid: validatedData.jenis_stok_uuid,
        supplier_uuid: validatedData.supplier_uuid,
        tanggal_pembelian: validatedData.tanggal_pembelian,
        metode_pembelian: validatedData.metode_pembelian,
        catatan_po: validatedData.catatan_po,
        isCito: validatedData.is_cito,
        total_item: validatedData.items.length,
        diskon: validatedData.diskon,
        materai: validatedData.materai,
        ppn: ppnRate,
        grand_total: grandTotal,
      };

      await InventoryBarangRepository.updatePurchaseOrder(dataToUpdate, transaction);

      if (validatedData.items) {
        await InventoryBarangRepository.deletePurchaseOrder(validatedData.uuid, transaction);
        if (validatedData.items.length > 0) {
          const newItems = validatedData.items.map((item) => ({
            ...item,
            pembelian_barang_supplier_uuid: validatedData.uuid,
            faskes_uuid: validatedData.faskes_uuid,
            total_harga: item.qty_order * item.harga_satuan,
          }));
          await InventoryBarangRepository.bulkCreate(newItems, transaction);
        }
      }
      await transaction.commit();
      
      return await InventoryBarangRepository.getDetail({
        uuid: validatedData.uuid,
        faskes_uuid: validatedData.faskes_uuid,
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
