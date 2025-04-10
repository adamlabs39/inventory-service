import ZodValidator from "../validations/zod-validator.js";
import InventoryValidation from "../validations/inventory-validation.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import InternalServerException from "../errors/internal-server-exception.js";

import {uuidv7} from "uuidv7";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";
import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";

export default class PenerimaanBarangService {
    static async orderPenerimaan(req) {
        ZodValidator.validate(InventoryValidation.DATA_SATUAN, req);

        const tr = await sequelizeInstance.transaction();

        try {
            // update purchase order barang
            const purchaseOrder = await InventoryBarangRepository.updatePurchaseOrder(
                req,
                tr
            );

            // update detail item purchase order barang
            if (req.items !== undefined && Array.isArray(req.items)) {
                const updateItemPo = req.items
                    .filter((item) => item.uuid)
                    .map((item) => ({
                        ...item,
                        pembelian_barang_supplier_uuid: req.uuid,
                    }));
                if (updateItemPo.length > 0) {
                    await Promise.all(
                        updateItemPo.map((item) =>
                            InventoryBarangRepository.updatePurchaseOrderItems(item, tr)
                        )
                    );
                }
            }

            // create detail item stok medis
            let dataInventory = await InventoryBarangRepository.getDataPurchaseOrder(
                req
            );

            let itemMedisJenisStok = await ItemMedisJenisStokRepository.getForPengadaanBarang({
                jenis_stok_uuid: dataInventory.jenis_stok_uuid,
                item_medis_uuids: dataInventory?.pbsu?.map((item) => item.item_uuid),
                faskes_uuid: req.faskes_uuid,
            });

            for (let i = 0; i < dataInventory?.pbsu.length; i++) {
                let item = itemMedisJenisStok.find(
                    (item) => item.item_medis_uuid === dataInventory.pbsu[i].item_uuid
                );

                if (!item) {
                    throw new InternalServerException(
                        `Item medis jenis stok with uuid ${dataInventory.pbsu[i].item_uuid} not found`
                    );
                }
            }

            var arrayItem = dataInventory?.pbsu.map((items) => {
                return {
                    exp_date: items.exp_date,
                    stok: items.qty_order,
                    sisa_stok: items.qty_order - items.qty_terima,
                    konversi_uuid: items.konversi_uuid,
                    lokasi_stok_uuid: dataInventory.lokasi_stok_uuid,
                    item_medis_jenis_stok_uuid: itemMedisJenisStok.find(
                        (item) => item.item_medis_uuid === items.item_uuid).uuid,
                    harga_satuan: items.harga_satuan,
                    no_po: dataInventory.no_po,
                    faskes_uuid: req.faskes_uuid,
                    uuid: uuidv7(),
                };
            });

            await InventoryBarangRepository.bulkCreateStokMedis(arrayItem, tr);

            // TODO : LOG TO TABLE HISTORI MUTASI

            await tr.commit();

            return purchaseOrder;
        } catch (e) {
            await tr.rollback();
            throw new InternalServerException(e.message);
        }
    }

    static async getAll(req) {
        ZodValidator.validate(InventoryValidation.GET_FILTER, req);
        return await InventoryBarangRepository.getAll(req);
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
