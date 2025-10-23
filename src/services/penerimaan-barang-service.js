import sequelizeInstance from "../configurations/sequelize-instance.js";
import BadRequestException from "../errors/bad-request-exception.js";
import InternalServerException from "../errors/internal-server-exception.js";
import NotfoundException from "../errors/notfound-exception.js";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";
import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
import SettingRepository from "../repositories/setting-repository.js";
import HargaItemRepository from "../repositories/harga-item-repository.js"; 
import PenerimaanValidation from "../validations/penerimaan-validation.js";

export default class PenerimaanBarangService {
    static async createPenerimaan(payload) {
        const validatedData = await PenerimaanValidation.CREATE_PENERIMAAN_BARANG.parseAsync(payload);
        const purchaseOrder = await InventoryBarangRepository.getDetail(validatedData);

        if (!purchaseOrder) {
            throw new NotfoundException("Data Pengadaan Barang yang akan diterima tidak ditemukan");
        }
        
        if (purchaseOrder.status !== "verifikasi") {
            throw new BadRequestException([
                {
                    field: "status",
                    message: `Hanya PO dengan status verifikasi yang dapat diterima. Status saat ini: ${purchaseOrder.status}`
                }
            ]);
        }

        let ppnRate = 0;
        if (validatedData.ppn === true) {
            ppnRate = await SettingRepository.getCurrentPpnRate(); 
        }

        const dataToUpdateHeader = {
            uuid: validatedData.uuid,
            faskes_uuid: validatedData.faskes_uuid,
            status: "diterima", 
            tanggal_terima: validatedData.tanggal_terima,
            no_faktur: validatedData.no_faktur,
            tanggal_faktur: validatedData.tanggal_faktur,
            no_surat_jalan: validatedData.no_surat_jalan,
            catatan_penerimaan: validatedData.catatan_penerimaan,
            petugas_pengirim: validatedData.petugas_pengirim,
            petugas_penerima: validatedData.petugas_penerima,
            petugas_penerima_uuid: validatedData.petugas_penerima_uuid,
            diskon: validatedData.diskon,
            materai: validatedData.materai,
            ppn: ppnRate, 
        };

        const transaction = await sequelizeInstance.transaction();
        try {
            await InventoryBarangRepository.updateStatusToDiterima(dataToUpdateHeader, transaction);
            
            if (validatedData.items && validatedData.items.length > 0) {
                for (const item of validatedData.items) {
                    await InventoryBarangRepository.updatePurchaseOrderItems({
                        ...item,
                        faskes_uuid: validatedData.faskes_uuid
                    }, transaction);
                }
            }

            const itemPoMap = new Map(
                purchaseOrder.pbsu.map(item => [item.uuid, item])
            );

            const itemUuidsInPo = purchaseOrder.pbsu.map(item => item.item_uuid);
            const itemMedisJenisStokList = await ItemMedisJenisStokRepository.getForPengadaanBarang({
                item_medis_uuids: itemUuidsInPo,
                jenis_stok_uuid: purchaseOrder.jenis_stok_uuid,
                faskes_uuid: validatedData.faskes_uuid,
            });

            const itemStokMap = new Map(
                itemMedisJenisStokList.map(ims => [ims.item_medis_uuid, ims])
            );

            const itemsToCreateStock = [];
            
            for (const itemDiterima of validatedData.items) {
                if (itemDiterima.qty_terima <= 0) {
                    continue;   
                }

                const itemPoAsli = itemPoMap.get(itemDiterima.uuid);
                if (!itemPoAsli) {
                    throw new BadRequestException(`Item dengan UUID ${itemDiterima.uuid} tidak ditemukan di dalam PO asli.`);
                }
                const correspondingItemStok = itemStokMap.get(itemPoAsli.item_uuid);
                if (!correspondingItemStok) {
                    throw new InternalServerException(`Konfigurasi jenis stok untuk item ${itemPoAsli.item_uuid} (${itemPoAsli.item_nama}) tidak ditemukan.`);
                }
                itemsToCreateStock.push({
                    exp_date: new Date(itemDiterima.exp_date),
                    stok: itemDiterima.qty_terima,      
                    sisa_stok: itemDiterima.qty_terima, 
                    konversi_uuid: itemPoAsli.konversi_uuid, 
                    lokasi_stok_uuid: purchaseOrder.lokasi_stok_uuid,
                    item_medis_jenis_stok_uuid: correspondingItemStok.uuid, 
                    harga_satuan: itemPoAsli.harga_satuan, 
                    no_po: purchaseOrder.no_po,
                    faskes_uuid: validatedData.faskes_uuid,
                });

                const harga_dasar = itemPoAsli.harga_satuan;
                const hna = harga_dasar * (1 + ppnRate); 

                await HargaItemRepository.updateOrInsertHargaItem(
                    {
                        item_medis_jenis_stok_uuid: correspondingItemStok.uuid,
                        faskes_uuid: validatedData.faskes_uuid,
                        harga_dasar: harga_dasar,
                        hna: hna,
                    },
                    transaction
                );
            }

            if (itemsToCreateStock.length > 0) {
                await InventoryBarangRepository.bulkCreateStokMedis(itemsToCreateStock, transaction);
            }

            // TODO : LOG TO TABLE HISTORI MUTASI

            await transaction.commit();

            return await InventoryBarangRepository.getDetail(validatedData);

        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
}