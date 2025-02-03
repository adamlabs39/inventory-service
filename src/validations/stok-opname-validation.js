import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class StokOpnameValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
    });

    static GET_STOCK_CARD = z.object({
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
        jenis_stok_uuids: z.string().min(1, required),
        jenis_items: z.string().min(1, required),
        type: z.string().min(1, required),
    });

    static SAVE = z.object({
        faskes_uuid: z.string().min(1, required),
        type: z.string().min(1, required),
        items: z.optional(z.array(z.object({
            kode_item: z.string().min(1, required),
            stok_fisik: z.number().min(0, required),
            stok_sistem: z.number().min(0, required),
            id_stok: z.string().min(1, required),
            ed: z.string().min(1, required),
            nama: z.string().min(1, required),
            kategori: z.string().min(1, required),
            jenis_item: z.string().min(1, required),
            jenis_stok: z.string().min(1, required),
            satuan: z.optional(z.string().min(1, required)),
            stok_awal: z.number().min(0, required),
            stok_masuk: z.number().min(0, required),
            stok_keluar: z.number().min(0, required),
            harga_dasar: z.number().min(0, required),
            harga_akhir: z.number().min(0, required)
        }))),
        stok_opname_uuid: z.optional(z.string().min(1, required)),
        tanggal_cut_off: z.number().gte(1000000000, required),
        judul_stok_opname: z.string().min(1, required),
        jenis_stoks: z.array(z.string()),
        kategori_item: z.enum(["medis", "non-medis"], {message: "kategori item harus medis atau non-medis"}),
        jenis_items: z.array(z.string()),
        lokasi_stok_uuid: z.string().min(1, required)
    });

    static DELETE_SOME = z.object({
        uuids: z.array(z.string().min(1, required))
    })
}