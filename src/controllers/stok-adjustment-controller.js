import successResponse from "../responses/success-response.js";
import StokAdjustmentService from "../services/stok-adjustment-service.js";

export default class StokAdjustmentController {
  static async getAll(req, res, nextFunction) {
    try {
      req.query.faskes_uuid = req.author.faskesUuid;
      const data = await StokAdjustmentService.getAll(req.query);
      res
        .status(200)
        .json(
          successResponse(
            "Data berhasil ditampilkan",
            data.data,
            data.pagination
          )
        );
    } catch (error) {
      nextFunction(error);
    }
  }

  static async getDetail(req, res, nextFunction) {
    try {
      req.query.uuid = req.params.uuid;
      const data = await StokAdjustmentService.getDetail(req.query);
      res.status(200).json(successResponse("Data berhasil ditampilkan", data));
    } catch (error) {
      nextFunction(error);
    }
  }

  static async update(req, res, nextFunction) {
    try {
      req.body.faskes_uuid = req.author.faskesUuid;
      req.body.petugas_sa = req.author.username;
      await StokAdjustmentService.update(req.body);
      res.status(201).json(successResponse("data berhasil diupdate"));
    } catch (error) {
      nextFunction(error);
    }
  }
}
