import StockMedisRepository from "../repositories/stock-medis-repository.js";
import NotfoundException from "../errors/notfound-exception.js";
import ConversionRepository from "../repositories/Conversion_repository.js";
import {toEpochDate} from "../helpers/date-helper.js";

export default class RiwayatTarifService {
    static async getAll(req) {
        const result = await StockMedisRepository.getRiwayatTarif(req);
        if (result.data && result.data.length > 0) {
            result.data = result.data.map((item) => {
                const totalStock = (item.stocks || []).reduce((acc, batch) => acc + batch.sisa_stok, 0);
                const latestStockBatch = (item.stocks || []).sort((a, b) => b.created_at - a.created_at)[0];
                return {
                    uuid: item.item_medis?.uuid ?? null,
                    name: item.item_medis?.name,
                    jenis_item: item.item_medis?.jenis_item,
                    jenis_stok: item.detail_stok?.name,
                    kategori_item: "medis",
                    stok: totalStock,
                    satuan_pembelian: latestStockBatch?.konversi?.satuan_pembelian,
                    satuan_penggunaan: latestStockBatch?.konversi?.satuan_penggunaan,
                    exp_date: latestStockBatch?.exp_date ? toEpochDate(latestStockBatch.exp_date) : null,

                    // TODO Belum Disesuaikan dengan tabel harga item
                    harga_dasar: latestStockBatch?.harga_satuan ?? 0,
                    hna: latestStockBatch?.harga_satuan ?? 0, 
                    hja: latestStockBatch?.harga_satuan ?? 0, 
                };
            });
        }
        return result;
    }

    static async getDetail(req) {
        const stock = await StockMedisRepository.getDetail(req);

        if (!stock) {
            throw new NotfoundException("Stock medis dengan id ini tidak ditemukan");
        }

        const itemJenisStok = stock.item_medis_jenis_stok;

        const historyOptions = {
            item_medis_jenis_stok_uuid: itemJenisStok.uuid,
            faskes_uuid: req.faskes_uuid,
        };

        const conversionOptions = {
            item_medis_uuid: itemJenisStok.item_medis_uuid,
            faskes_uuid: req.faskes_uuid,
        };

        const [purchaseHistory, conversions] = await Promise.all([
            StockMedisRepository.getPurchaseHistory(historyOptions),
            ConversionRepository.getAll(conversionOptions)
        ]);

        const { item_medis, detail_stok } = itemJenisStok;

        return {
            kode_item: item_medis?.code,
            kategori_item: "medis",
            jenis_item: item_medis?.jenis_item,
            jenis_stok: detail_stok?.name,
            satuan_penggunaan: item_medis?.satuan_penggunaan?.name,
            harga_dasar: stock.harga_satuan,
            hna: stock.harga_satuan,
            hja: stock.harga_satuan,
            pabrik: item_medis?.manufacture?.name,
            conversions: conversions ?? [],
            purchase_history: (purchaseHistory ?? []).map((item) => ({
                tanggal: item.created_at,
                exp_date: item.exp_date ? toEpochDate(item.exp_date) : null,
                harga_dasar: item.harga_satuan,
                hna: item.harga_satuan,
                hja: item.harga_satuan,
                no_po: item.no_po,
            })),
        };
    }
}