import {ConversionModel, JenisStokModel} from "@adameds/model-sdk/farmasi";
import {
    PembelianBarangSupplierModel, PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel, ReturUnitItemModel, ReturUnitModel, RiwatatMutasiModel, StokOpnameItemModel, StokOpnameModel,
} from "@adameds/model-sdk/inventory";

const MODELMERGE = [
    // PembelianBarangSupplierModel,
    // MasterSupplierModel,
    PermintaanUnitModel,
    PermintaanUnitItemModel,
    PengeluaranUnitModel,
    PengeluaranUnitItemModel,
    RiwatatMutasiModel,
    StokOpnameModel,
    StokOpnameItemModel,
    ReturUnitModel,
    ReturUnitItemModel
];

export default MODELMERGE;
