import {z} from "zod";
import {
    faskesUuidRequired,
    required,
    uuidRequired,
} from "./message-validation-error.js";
import DatamasterSupplierRepository from "../repositories/datamaster-supplier-repository.js";

export default class DatamasterValidation {
    static CREATE_SATUAN = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
    });

    static CREATE_INGREDIENT = z.object({
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
    });

    static CREATE_BENTUK_RACIKAN = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        nama_bentuk_racikan: z.string().min(1, required),
        jumlah: z.number(),
        tarif_embalase: z.number(),
        tarif_racik: z.number(),
    });

    static CREATE_ATURAN_PAKAI = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        frekuensi: z.number(),
        name: z.string().min(1, required),
        periode_unit: z.string().min(1, required),
        periode: z.number(),
        code: z.string().min(1, required),
    });

    static CREATE_MANUFACTURE = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
        alamat: z.string().min(1, required),
        kecamatan_code: z.string().min(1, required),
        provinsi_code: z.string().min(1, required),
        kabupaten_code: z.string().min(1, required),
        kelurahan_code: z.string().min(1, required),
        kode_pos: z.string().min(1, required),
    });

    static CREATE_SUPPLIER = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z
            .string()
            .min(1, "Kode harus diisi")
            .refine(
                (codes) => {
                    try {
                        return isCodeUnique(codes);
                    } catch (err) {
                        console.error("Error validasi unik:", err);
                        return false; // Gagal validasi
                    }
                },
                {message: "Kode sudah digunakan"}
            ),
        alamat: z.string().min(1, required),
        kecamatan_code: z.string().min(1, required),
        provinsi_code: z.string().min(1, required),
        kabupaten_code: z.string().min(1, required),
        kelurahan_code: z.string().min(1, required),
        no_tlp: z.string().min(1, required),
    });

    static CREATE_LOKASI_STOK = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
        jenis_lokasi: z.string().min(1, required),
    });

    static UPDATE_SATUAN = z.object({
        uuid: z.string().min(1, uuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
    });

    static UPDATE_BENTUK_RACIKAN = z.object({
        uuid: z.string().min(1, uuidRequired),
        nama_bentuk_racikan: z.string().min(1, required),
        jumlah: z.number(),
        tarif_embalase: z.number(),
        tarif_racik: z.number(),
    });

    static UPDATE_ATURAN_PAKAI = z.object({
        uuid: z.string().min(1, uuidRequired),
        status: z.boolean(),
        frekuensi: z.number(),
        periode_unit: z.string().min(1, required),
        name: z.string().min(1, required),
        periode: z.number(),
        code: z.string().min(1, required),
    });

    static UPDATE_LOKASI_STOK = z.object({
        uuid: z.string().min(1, uuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
        jenis_lokasi: z.string().min(1, required),
    });

    static UPDATE_MANUFACTURE = z.object({
        uuid: z.string().min(1, uuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
        alamat: z.string().min(1, required),
        demografi_wilayah_code: z.string().min(1, required),
    });

    static UPDATE_SUPPLIER = z.object({
        uuid: z.string().min(1, uuidRequired),
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        name: z.string().min(1, required),
        code: z.string().min(1, required),
        alamat: z.string().min(1, required),
        supplier_items: z.array(z.object({"kategori_item": z.string().min(1, required)})),
        // demografi_wilayah_code: z.string().min(1, required),
    });

    static GET_ALL_SATUAN = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
    });

    static DELETE_SATUAN = z.object({
        uuid: z.string().min(1, uuidRequired),
    });

    static CREATE_CARA_PAKAI = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        status: z.boolean(),
        cara_pakai: z.string().min(1, required),
        code: z.string().min(1, required),
    });

    static UPDATE_CARA_PAKAI = z.object({
        uuid: z.string().min(1, uuidRequired),
        status: z.boolean(),
        cara_pakai: z.string().min(1, required),
        code: z.string().min(1, required),
    });

    static CREATE_ITEM_MEDIS = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        code: z.string().min(1, required),
        name: z.string().min(1, required),
        jenis_item: z.string().min(1, required),
        satuan_penggunaan_uuid: z.string().min(1, required),
        manufacture_uuid: z.string().min(1, required),
        bentuk_sediaan_uuid: z.string().min(1, required),
        dosis: z.number(),
        satuan_dosis_uuid: z.string().min(1, required),
        isi_kemasan: z.number(),
        satuan_kemasan_uuid: z.string().min(1, required),
        kategori_obat_uuid: z.string().min(1, required),
        satuan_pembelian_uuid: z.string().min(1, required),
        status: z.boolean(),
    });

    static UPDATE_ITEM_MEDIS = z.object({
        uuid: z.string().min(1, uuidRequired),
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        code: z.string().min(1, required),
        name: z.string().min(1, required),
        jenis_item: z.string().min(1, required),
        satuan_penggunaan_uuid: z.string().min(1, required),
        manufacture_uuid: z.string().min(1, required),
        bentuk_sediaan_uuid: z.string().min(1, required),
        dosis: z.number(),
        satuan_dosis_uuid: z.string().min(1, required),
        isi_kemasan: z.number(),
        satuan_kemasan_uuid: z.string().min(1, required),
        kategori_obat_uuid: z.string().min(1, required),
        satuan_pembelian_uuid: z.string().min(1, required),
        status: z.boolean(),
    });

    static GET_CONVERSIONS = z.object({
        item_medis_uuid: z.string().min(1, uuidRequired),
    });

    static INSERT_JENIS_STOK_ITEM_MEDIS = z.object({
        jenis_stok_uuid: z.string().min(1, required),
    });

    static UPDATE_JENIS_STOK_ITEM_MEDIS = z.object({
        jenis_stok_uuid: z.string().min(1, required),
        uuid: z.string().min(1, required),
    });

    static DELETE_JENIS_STOK_ITEM_MEDIS = z.object({
        uuid: z.string().min(1, required),
    });

    static GET_AVAILABLE_JENIS_STOK = z.object({
        item_medis_uuid: z.string().min(1, required),
    });
}

async function isCodeUnique(code) {
    const result = await DatamasterSupplierRepository.getCode(code);

    // Jika result bernilai null atau undefined
    if (!result) {
        return true; // Jika tidak ada data, anggap kode unik
    }
    // Jika result berupa array
    if (Array.isArray(result)) {
        return !result.includes(code);
    }

    // Jika result berupa objek dengan array `data`
    if (result.data && Array.isArray(result.data)) {
        const codes = result.data.map((item) => item.code);
        return !codes.includes(code);
    }

    // Jika result adalah objek tunggal
    if (result.code) {
        return result.code !== code;
    }

    return true; // Default jika tidak ada data
}
