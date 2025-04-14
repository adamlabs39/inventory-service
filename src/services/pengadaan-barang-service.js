import ZodValidator from "../validations/zod-validator.js";
import InventoryValidation from "../validations/inventory-validation.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import InternalServerException from "../errors/internal-server-exception.js";

import Utils from "../helpers/utils.js";
import {uuidv7} from "uuidv7";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";

import NotfoundException from "../errors/notfound-exception.js";

export default class PengadaanBarangService {
    static async orderBarang(req) {
        const transaction = await sequelizeInstance.transaction();

        // ZodValidator.validate(AlkesValidation.ORDER_ALKES, req);
        // if (req.alkes === null || req.alkes === undefined) {
        //     throw new BadRequestException("'alkes' tidak boleh kosong");
        // }

        try {
            // create pembelian_barang
            let dataPembelianBarang = {
                faskes_uuid: req.faskes_uuid,
                no_po: Utils.generate4Code("PO"),
                kategori_item: req.kategori_item,
                jenis_stok_uuid: req.jenis_stok_uuid,
                jenis_item: req.jenis_item,
                supplier_uuid: req.supplier_uuid,
                tanggal_pembelian: req.tanggal_pembelian,
                metode_pembelian: req.metode_pembelian,
                catatan_po: req.catatan_po,
                isCito: req.is_cito,
                total_item: req.items.length,
                diskon: req.diskon ? req.diskon : 0,
                materai: req.materai ? req.materai : 0,
                ppn: req.ppn,
                grand_total: req.items.reduce((acc, item) => acc + (item.qty_order * item.harga_satuan), 0),
                petugas_pembuat_po: req.petugas_pembuat_po,
                petugas_pembuat_po_uuid: req.petugas_pembuat_po_uuid,
                status: "pending",
                lokasi_stok_uuid: req.lokasi_stok_uuid,
                tanggal_penerimaan: req.tanggal_penerimaan,
                catatan_penerimaan: req.catatan_penerimaan,
                ongkos_kirim: req.ongkos_kirim,
            };

            const order_pengadaan_barang =
                await InventoryBarangRepository.createPembelianBarang(
                    dataPembelianBarang,
                    transaction
                );

            const order_pengadaan_barang_uuid =
                order_pengadaan_barang.dataValues.uuid;
            order_pengadaan_barang.dataValues.pembelian_items = [];

            // create pembeliaan item
            for (const item of req.items) {
                item.pembelian_barang_supplier_uuid = order_pengadaan_barang_uuid;
                item.faskes_uuid = req.faskes_uuid;
                item.total_harga = item.qty_order * item.harga_satuan;

                // ZodValidator.validate(AlkesValidation.CREATE_ALKES_ITEM, item);
                const data_pembelian_item =
                    await InventoryBarangRepository.createPembelianBarangItem(
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
        return await InventoryBarangRepository.getAll(req);
    }

    static async getDetail(req) {
        const result = await InventoryBarangRepository.getDetail(req);

        if (!result) {
            throw new NotfoundException("Data tidak ditemukan");
        }

        return {
            uuid: req.uuid,
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
            items: result.pbsu?.map((item) => ({
                total_harga: item.total_harga ?? 0,
                harga_satuan: item.harga_satuan ?? 0,
                qty_order: item.qty_order ?? 0,
                satuan_beli: `${item.cnvrsn?.satuan_pembelian ?? "-"}/${item.cnvrsn?.konversi ?? ""} ${item.cnvrsn?.satuan_penggunaan ?? "-"}`,
                nama: item.item_medis?.name ?? "",
                item_uuid: item.item_uuid ?? "",
                conversion_uuid: item.konversi_uuid ?? "",
                satuan_beli_uuid: item.cnvrsn?.satuan_pembelian_uuid ?? "",
            })) ?? [],
            total_item: result.total_item ?? 0,
            diskon: result.diskon ?? 0,
            materai: result.materai ?? 0,
            ppn: result.ppn ?? 0,
            grand_total: result.grand_total ?? 0,
            petugas_pembuat_po: result.petugas_pembuat_po ?? "",
        }
    }

    static cancelPembelianBarang(req) {
        ZodValidator.validate(InventoryValidation.DATA_SATUAN, req);
        return InventoryBarangRepository.update(req);
    }

    static async update(req) {
        // ZodValidator.validate(InventoryValidation.UPDATE_ITEM_MEDIS, req);
        const tr = await sequelizeInstance.transaction();

        try {
            const purchaseOrder = await InventoryBarangRepository.updatePurchaseOrder(
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
                    await InventoryBarangRepository.bulkCreate(newItem, tr);
                }

                if (updatedItem.length > 0) {
                    await Promise.all(
                        updatedItem.map((item) =>
                            InventoryBarangRepository.updatePurchaseOrderItems(item, tr)
                        )
                    );
                }

                if (deletedItem.length > 0) {
                    await Promise.all(
                        deletedItem.map((item) =>
                            InventoryBarangRepository.delete(item, tr)
                        )
                    );
                }
            }

            await tr.commit();
            return purchaseOrder;
        } catch (e) {
            await tr.rollback();
            throw new InternalServerException(e.message);
        }
    }
}
