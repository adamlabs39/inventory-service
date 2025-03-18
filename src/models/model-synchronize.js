import {
    MasterSupplierKategoriItemModel,
    MasterSupplierModel,
    PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel, ReturUnitItemModel, ReturUnitModel, RiwayatMutasiModel, StokOpnameItemModel, StokOpnameModel,
} from "@adameds/model-sdk/inventory";

const MODELMERGE = [
    // PembelianBarangSupplierModel,
    MasterSupplierModel,
    MasterSupplierKategoriItemModel,
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
