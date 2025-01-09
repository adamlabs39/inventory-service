import {ConversionModel, JenisStokModel} from "@adameds/model-sdk/farmasi";
import {
    PembelianBarangSupplierModel, PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel, RiwatatMutasiModel, StokOpnameItemModel, StokOpnameModel,
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
    StokOpnameItemModel
];

export default MODELMERGE;
