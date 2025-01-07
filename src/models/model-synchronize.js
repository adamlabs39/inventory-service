import {ConversionModel, JenisStokModel} from "@adameds/model-sdk/farmasi";
import {
    PembelianBarangSupplierModel, PengeluaranUnitItemModel,
    PengeluaranUnitModel,
    PermintaanUnitItemModel,
    PermintaanUnitModel
} from "@adameds/model-sdk/inventory";
import {MasterSupplierModel} from "@adameds/model-sdk/inventory";

const MODELMERGE = [
    // PembelianBarangSupplierModel,
    // MasterSupplierModel,
    PermintaanUnitModel,
    PermintaanUnitItemModel,
    PengeluaranUnitModel,
    PengeluaranUnitItemModel
];

export default MODELMERGE;
