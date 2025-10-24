import KartuStokService from "../services/kartu-stok-service.js";
import successResponse from "../responses/success-response.js";

export default class KartuStokController {
  static async getAll(req, res, nextFunction) {
    try {
      const options = {
        ...req.query,
        faskes_uuid: req.author.faskesUuid,
      };
      const result = await KartuStokService.getAll(options);
      res.status(200).json(successResponse("Data berhasil ditampilkan", result.data, result.pagination));
    } catch (error) {
      nextFunction(error);
    }
  }
}
