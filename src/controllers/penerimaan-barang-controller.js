import successResponse from "../responses/success-response.js";
import PenerimaanBarangService from "../services/penerimaan-barang-service.js";

export default class PenerimaanBarangController {
  static async createPenerimaan(req, res, nextFunction) {
    try {
      // req.body.faskes_uuid = req.author.faskesUuid;
      req.body.faskes_uuid = "0192b31f-365d-731c-8b16-3a4565c9475e";
      const { uuid } = req.params;
      req.body.uuid = uuid;

      const result = await PenerimaanBarangService.orderPenerimaan(req.body);
      res.status(201).json(successResponse("data berhasil dibuat", result));
    } catch (error) {
      console.log("error", error);

      nextFunction(error);
    }
  }
}
