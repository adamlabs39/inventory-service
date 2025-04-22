import RiwayatMutasiService from "../services/riwayat-mutasi-service.js";

export default class RiwayatMutasiController {
  static async getAll(req, res, nextFunction) {
    try {
      req.query.faskes_uuid = req.author.faskesUuid;
      const result = await RiwayatMutasiService.getAll(req.query);
      // res.status(200).json(result)
      res.status(200).json(successResponse("Data berhasil ditampilkan", result));
    } catch (error) {
      nextFunction(error);
    }
  }

  static async create(req, res, nextFunction) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      req.body.petugas = req.author.username;
      const result = await RiwayatMutasiService.create(req.body);
      res.status(200).json(result);
    } catch (error) {
      nextFunction(error);
    }

    // 1. penjualan obat ✅
    // 2. verifikasi resep dokter ✅
    // 3. retur alkes & obat ✅
    // 4. verifikasi farmasi ruangan ✅

    // 5. pengiriman unit ✅
    // 6. pengeluaran unit ✅
    // 7. stok adjustment ✅
    // 8. stok opname ✅
  }
}
