import StockValidation from "../validations/stock-validation.js"; 
import NotFoundException from "../errors/notfound-exception.js";
import StockRepository from "../repositories/stock-medis-repository.js";

export default class StockService {
static async getAvailableStock(req) {
    const validatedReq = StockValidation.GET_STOCK.parse(req);
    const stocks = await StockRepository.findStockByItem(validatedReq);

    if (stocks.length === 0) {
        throw new NotFoundException("Stok untuk item yang dicari tidak ditemukan");
    }

    return stocks.map(stock => ({
        item_uuid: stock['item_medis_jenis_stok.item_medis_uuid'],
        item_name: stock['item_medis_jenis_stok.item_medis.name'],
        lokasi_stok_uuid: stock.lokasi_stok_uuid,
        lokasi_stok_name: stock['lokasi_stok.name'],
        jumlah_tersedia: parseInt(stock.jumlah_tersedia, 10),
        satuan: stock['item_medis_jenis_stok.item_medis.satuan_penggunaan.name'] || 'N/A',
        harga_satuan: parseFloat(stock.harga_satuan),
    }));
}
}