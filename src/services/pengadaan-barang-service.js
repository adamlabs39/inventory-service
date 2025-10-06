import sequelizeInstance from "../configurations/sequelize-instance.js";
import BadRequestException from "../errors/bad-request-exception.js";
import NotfoundException from "../errors/notfound-exception.js";
import Utils from "../helpers/utils.js";
import DatamasterSupplierRepository from "../repositories/datamaster-supplier-repository.js";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";
import PengadaanValidation from "../validations/pengadaan-validation.js";

export default class PengadaanBarangService {
  static async create(payload) {
    const validatedData = await PengadaanValidation.CREATE_PEMBELIAN_BARANG.parseAsync(payload);
    const supplier = await DatamasterSupplierRepository.getByUuid({
      uuid: validatedData.supplier_uuid,
      faskes_uuid: validatedData.faskes_uuid
    });

    if (!supplier) {
      throw new BadRequestException(`Supplier tidak ditemukan.`);
    }

    const transaction = await sequelizeInstance.transaction();
    try {

      const subTotal = validatedData.items.reduce(
            (acc, item) => acc + (item.qty_order * item.harga_satuan), 0 
        );

      const totalPpn = subTotal * (validatedData.ppn / 100);
      const grandTotal = subTotal + totalPpn - (validatedData.diskon ?? 0) + (validatedData.materai ?? 0);

      const dataPembelianBarang = {
        ...validatedData,
        no_po: Utils.generate4Code("PO"),
        total_item: validatedData.items.length,
        grand_total: grandTotal,
        status: "pending",
      };
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
    const validatedOptions = await PengadaanValidation.GET_ALL_PEMBELIAN_BARANG.parseAsync(options);
    const finalOptions = {
      ...validatedOptions,
      page: validatedOptions.page || 1,
      limit: validatedOptions.limit || 10,
    }
    return await InventoryBarangRepository.getAll(finalOptions);
  }

  static async getDetail(payload) {
    const validatedPayload = await PengadaanValidation.GET_PEMBELIAN_BARANG_BY_UUID.parseAsync(payload);
    const result = await InventoryBarangRepository.getDetail(validatedPayload);

    if (!result) {
      throw new NotfoundException("Data tidak ditemukan");
    }

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
      catatan: result.catatan_po ?? "",
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
      petugas_pembuat_po: result.petugas_pembuat_po ?? "",
    };
  }

  static async cancelPembelianBarang(payload) {
    const validatedPayload = await PengadaanValidation.CANCEL_PEMBELIAN_BARANG.parseAsync(payload);
    const purchaseOrder = await InventoryBarangRepository.getDetail({
        uuid: validatedPayload.uuid,
        faskes_uuid: validatedPayload.faskes_uuid,
    });
    if (!purchaseOrder) {
        throw new NotfoundException("Data Pengadaan Barang yang akan dibatalkan tidak ditemukan");
    }
    if (purchaseOrder.status !== 'pending') {
        throw new BadRequestException(`Tidak dapat membatalkan PO dengan status "${purchaseOrder.status}"`);
    }
    return await InventoryBarangRepository.update(validatedPayload);
  }

  static async update(payload) {
    const validatedData = await PengadaanValidation.UPDATE_PEMBELIAN_BARANG.parseAsync(payload);

    const purchaseOrder = await InventoryBarangRepository.getDetail({
      uuid: validatedData.uuid,
      faskes_uuid: validatedData.faskes_uuid,
    });

    if (!purchaseOrder) {
      throw new NotfoundException("Data Pengadaan Barang yang akan diubah tidak ditemukan");
    }

    if (purchaseOrder.status !== 'pending') {
      throw new BadRequestException(`Hanya PO dengan status pending yang dapat diubah. Status saat ini: ${purchaseOrder.status}`);
    }

    const transaction = await sequelizeInstance.transaction();
    try {
      await InventoryBarangRepository.updatePurchaseOrder(validatedData, transaction);
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
