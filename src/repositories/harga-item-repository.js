import { HargaItemModel } from "@adameds/model-sdk/farmasi";
import InternalServerException from "../errors/internal-server-exception.js";

export default class HargaItemRepository {
    static async findOneByItemJenisStok(itemMedisJenisStokUuid, faskesUuid) {
        try {
            const hargaItem = await HargaItemModel.findOne({
                where: {
                    item_medis_jenis_stok_uuid: itemMedisJenisStokUuid,
                    faskes_uuid: faskesUuid,
                },
            });
            return hargaItem;
        } catch (e) {
            throw e;
        }
    }

    static async updateOrInsertHargaItem(data, transaction) {
        if (!data.item_medis_jenis_stok_uuid) {
            throw new InternalServerException("item_medis_jenis_stok_uuid wajib diisi saat update harga.");
        }

        try {
            const [hargaItem, created] = await HargaItemModel.findOrCreate({
                where: {
                    item_medis_jenis_stok_uuid: data.item_medis_jenis_stok_uuid,
                    faskes_uuid: data.faskes_uuid,
                },
                defaults: {
                    item_medis_jenis_stok_uuid: data.item_medis_jenis_stok_uuid,
                    faskes_uuid: data.faskes_uuid,
                    harga_dasar: data.harga_dasar,
                    hna: data.hna,
                    harga_terakhir: data.hna,
                    harga_avg: data.hna,
                },
                transaction: transaction,
            });

            if (!created) {
                hargaItem.harga_dasar = data.harga_dasar;
                hargaItem.hna = data.hna;
                hargaItem.harga_terakhir = data.hna;
                
                // TODO: Logika untuk `harga_avg` (harga rata-rata)
                // Ini bisa jadi lebih kompleks, misalnya:
                // (harga_avg_lama * stok_lama) + (hna_baru * stok_baru) / (stok_lama + stok_baru)
                // Untuk sekarang, kita update saja agar nilainya relevan.
                hargaItem.harga_avg = data.hna; 

                await hargaItem.save({ transaction: transaction });
            }

            return hargaItem;

        } catch (error) {
            throw new InternalServerException(`Gagal update harga item: ${error.message}`);
        }
    }
}