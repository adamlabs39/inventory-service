import { ConversionModel, JenisStokModel, LokasiStokModel } from "@adameds/model-sdk/farmasi";
import { MasterSupplierKategoriItemModel, PembelianBarangSupplierItemModel, PembelianBarangSupplierModel } from "@adameds/model-sdk/inventory";
import { MasterSupplierModel } from "@adameds/model-sdk/inventory";
import { ItemMedisModel } from "@adameds/model-sdk/farmasi";
import { KabupatenModel, KecamatanModel, KelurahanModel, ProvinceModel } from "@adameds/model-sdk/datamaster";

export default function defineAssociations() {
    PembelianBarangSupplierModel.belongsTo(MasterSupplierModel, {
        foreignKey: "supplier_uuid",
        as: "spplr"
    });
    PembelianBarangSupplierModel.belongsTo(JenisStokModel, {
        foreignKey: "jenis_stok_uuid",
        as: "jenis_stok"
    });
    PembelianBarangSupplierModel.belongsTo(LokasiStokModel, {
        foreignKey: "lokasi_stok_uuid",
        as: "lks"
    });
    PembelianBarangSupplierModel.hasMany(PembelianBarangSupplierItemModel, {
        foreignKey: "pembelian_barang_supplier_uuid",
        as: "pbsu",
        constraints: false,
    });
    PembelianBarangSupplierItemModel.belongsTo(PembelianBarangSupplierModel, {
        foreignKey: "pembelian_barang_supplier_uuid",
        as: "pbsu",
        constraints: false,
    });
    PembelianBarangSupplierItemModel.belongsTo(ItemMedisModel, {
        foreignKey: "item_uuid",
        as: "item_medis",
        constraints: false,
    });
    PembelianBarangSupplierItemModel.belongsTo(ConversionModel, {
        foreignKey: "konversi_uuid",
        as: "cnvrsn",
        constraints: false,
    });
    MasterSupplierModel.belongsTo(ProvinceModel, {
        foreignKey: "provinsi_code",
        targetKey: "code",
        as: "province",
        constraints: false,
    });
    
    MasterSupplierModel.belongsTo(KabupatenModel, {
        foreignKey: "kabupaten_code",
        targetKey: "code",
        as: "kabupaten",
        constraints: false,
    });
    
    MasterSupplierModel.belongsTo(KecamatanModel, {
        foreignKey: "kecamatan_code",
        targetKey: "code",
        as: "kecamatan",
        constraints: false,
    });
    
    MasterSupplierModel.belongsTo(KelurahanModel, {
        foreignKey: "kelurahan_code",
        targetKey: "code",
        as: "kelurahan",
        constraints: false,
    });
    
    MasterSupplierModel.hasMany(MasterSupplierKategoriItemModel, {
        foreignKey: "supllier_uuid",
        as: "supplier_items",
        constraints: false,
    });
    console.log("Associations defined.");
}