import sequelizeInstance from "../configurations/sequelize-instance.js";
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
        
        if (purchaseOrder.status !== 'verifikasi') {
            throw new BadRequestException(`Hanya PO dengan status verifikasi yang dapat diterima. Status saat ini: ${purchaseOrder.status}`);
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

            const itemsToCreateStock = purchaseOrder.pbsu.map(itemPo => {
                const itemFromBody = validatedData.items?.find(i => i.uuid === itemPo.uuid);

                const correspondingItem = itemMedisJenisStokList.find(
                    ims => ims.item_medis_uuid === itemPo.item_uuid
                );

                if (!correspondingItem) {
                    throw new InternalServerException(`Data Item Medis Jenis Stok untuk item ${itemPo.item_uuid} tidak ditemukan.`);
                }

                return {
                    exp_date: itemFromBody?.exp_date,
                    stok: itemPo.qty_order,
                    sisa_stok: itemPo.qty_order,
                    konversi_uuid: itemPo.konversi_uuid,
                    lokasi_stok_uuid: purchaseOrder.lokasi_stok_uuid,
                    item_medis_jenis_stok_uuid: correspondingItem.uuid,
                    harga_satuan: itemPo.harga_satuan,
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
