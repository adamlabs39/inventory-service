import {
    PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel, ReturUnitItemModel, ReturUnitModel, StokOpnameItemModel, StokOpnameModel,
} from "@adameds/model-sdk/inventory";

const MODELMERGE = [
    // PembelianBarangSupplierModel,
    // MasterSupplierModel,
    PermintaanUnitModel,
    PermintaanUnitItemModel,
    PengeluaranUnitModel,
    PengeluaranUnitItemModel,
    RiwayatMutasiModel,
    StokOpnameModel,
    StokOpnameItemModel,
    ReturUnitModel,
    ReturUnitItemModel
];

export default MODELMERGE;
