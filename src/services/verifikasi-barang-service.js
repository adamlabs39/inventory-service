import ZodValidator from "../validations/zod-validator.js";
import InventoryValidation from "../validations/inventory-validation.js";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";

export default class VerifikasiBarangService {
  static verifikasiPembelianBarang(req) {
    ZodValidator.validate(InventoryValidation.DATA_SATUAN, req);
    return InventoryBarangRepository.updateVerifikasi(req);
  }
}
