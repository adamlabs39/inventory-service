import StockMedisRepository from "../repositories/stock-medis-repository.js";
import NotfoundException from "../errors/notfound-exception.js";
import ConversionRepository from "../repositories/Conversion_repository.js";

export default class RiwayatTarifService {
    static async getAll(req) {
        const result = await StockMedisRepository.getRiwayatTarif(req);

        if (result.data === null || result.data.length === 0) {
            throw new NotfoundException("Data tidak ditemukan");
        }

        result.data = result.data.map((item) => {
            return {
                uuid: item.stocks[0]?.uuid ?? "",
                name: item.item_medis?.name,
                jenis_item: item.item_medis?.jenis_item,
                jenis_stok: item.detail_stok?.name,
                kategori_item: "medis",
                stok: item.stocks?.reduce((acc, item) => acc + item.sisa_stok, 0) ?? 0,
                satuan_pembelian: item.stocks[0]?.konversi?.satuan_pembelian,
                satuan_penggunaan: item.stocks[0]?.konversi?.satuan_penggunaan,
            }
        })

        return result;
    }

    static async getDetail(req) {
        const stock = await StockMedisRepository.getDetail(req);

        if (!stock) {
            throw new NotfoundException("Stock medis dengan id ini tidak ditemukan");
        }

        req.item_medis_uuid = stock.item_medis_jenis_stok?.item_medis_uuid;

        if (!req.item_medis_uuid) {
            throw new NotfoundException("Item medis dengan id ini tidak ditemukan");
        }

        req.item_medis_jenis_stok_uuid = stock.item_medis_jenis_stok_uuid;

        if (!req.item_medis_jenis_stok_uuid) {
            throw new NotfoundException("Item medis jenis stok dengan id ini tidak ditemukan");
        }

        const purchaseHistory = await StockMedisRepository.getPurchaseHistory(req);

        const conversions = await ConversionRepository.getAll(req);

        return {
            kode_item: stock.item_medis_jenis_stok?.item_medis?.code,
            kategori_item: "medis",
            jenis_item: stock.item_medis_jenis_stok?.item_medis?.jenis_item,
            jenis_stok: stock.item_medis_jenis_stok?.detail_stok?.name,
            satuan_penggunaan: stock.item_medis_jenis_stok?.item_medis?.satuan_penggunaan?.name,
            // TODO : BELOM DIPISAHIN HJA, HPP, HARGA DASAR
            harga_dasar: stock.harga_satuan,
            hja: stock.harga_satuan,
            hpp: stock.harga_satuan,
            pabrik: stock.item_medis_jenis_stok?.item_medis?.manufacture?.name,
            conversions: conversions ?? [],
            purchase_history: purchaseHistory.map((item) => {
                return {
                    tanggal: item.created_at,
                    exp_date: `${String(item.exp_date.getDate()).padStart(2, '0')}-${String(item.exp_date.getMonth() + 1).padStart(2, '0')}-${item.exp_date.getFullYear()}`,
                    // TODO : BELOM DIPISAHIN HJA, HPP, HARGA DASAR
                    harga_dasar: item.harga_satuan,
                    hja: item.harga_satuan,
                    hpp: item.harga_satuan,
                    no_po: item.no_po,
                }
            }) ?? [],
        }
    }
}