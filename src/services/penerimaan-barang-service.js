import sequelizeInstance from "../configurations/sequelize-instance.js";
import BadRequestException from "../errors/bad-request-exception.js";
import InternalServerException from "../errors/internal-server-exception.js";
import NotfoundException from "../errors/notfound-exception.js";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";
import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
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

        const transaction = await sequelizeInstance.transaction();
        try {
            await InventoryBarangRepository.updateStatusToDiterima(validatedData, transaction);
            if (validatedData.items && validatedData.items.length > 0) {
                for (const item of validatedData.items) {
                    await InventoryBarangRepository.updatePurchaseOrderItems({
                        ...item,
                        faskes_uuid: validatedData.faskes_uuid
                    }, transaction);
                }
            }

            const itemUuidsInPo = purchaseOrder.pbsu.map(item => item.item_uuid);

            const itemMedisJenisStokList = await ItemMedisJenisStokRepository.getForPengadaanBarang({
                item_medis_uuids: itemUuidsInPo,
                jenis_stok_uuid: purchaseOrder.jenis_stok_uuid,
                faskes_uuid: validatedData.faskes_uuid,
            });

            const itemsToCreateStock = validatedData.items
                .filter(item => item.qty_terima > 0)
                .map(itemDiterima => {
                    const itemPoAsli = purchaseOrder.pbsu.find(i => i.uuid === itemDiterima.uuid);
                    if (!itemPoAsli) {
                        throw new BadRequestException(`Item dengan UUID ${itemDiterima.uuid} tidak ditemukan di dalam PO asli.`);
                    }

                    const correspondingItem = itemMedisJenisStokList.find(
                        ims => ims.item_medis_uuid === itemPoAsli.item_uuid
                    );

                    if (!correspondingItem) {
                        throw new InternalServerException(`Konfigurasi jenis stok untuk item ${itemPoAsli.item_uuid} tidak ditemukan.`);
                    }

                    return {
                        exp_date: new Date(itemDiterima.exp_date),
                        stok: itemDiterima.qty_terima,      
                        sisa_stok: itemDiterima.qty_terima, 
                        konversi_uuid: itemPoAsli.konversi_uuid, 
                        lokasi_stok_uuid: purchaseOrder.lokasi_stok_uuid,
                        item_medis_jenis_stok_uuid: correspondingItem.uuid,
                        harga_satuan: itemPoAsli.harga_satuan, 
                        no_po: purchaseOrder.no_po,
                        faskes_uuid: validatedData.faskes_uuid,
                    };
                });

            await InventoryBarangRepository.bulkCreateStokMedis(itemsToCreateStock, transaction);

            await transaction.commit();

            return await InventoryBarangRepository.getDetail(validatedData);
            // TODO : LOG TO TABLE HISTORI MUTASI
            // TODO : CREATE DATA IN HARGA ITEM TABLE
        } catch (e) {
            await transaction.rollback();
            throw new InternalServerException(e.message);
        }
    }
}
