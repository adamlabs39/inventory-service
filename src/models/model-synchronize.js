import {
    MasterSupplierKategoriItemModel,
    MasterSupplierModel,
    PembelianBarangSupplierItemModel,
    PembelianBarangSupplierModel,
    PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel, ReturSupplierItemModel,
    ReturSupplierModel,
    ReturUnitItemModel,
    ReturUnitModel,
    RiwayatMutasiModel,
    StokOpnameItemModel,
    StokOpnameModel,
} from "@adameds/model-sdk/inventory";

const MODELMERGE = [
    PembelianBarangSupplierModel,
    PembelianBarangSupplierItemModel,
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
    ReturUnitItemModel,
    ReturSupplierModel,
    ReturSupplierItemModel
];

export default MODELMERGE;
