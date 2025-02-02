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
        items: z.optional(z.array(z.object({}))),
        stok_opname_uuid: z.optional(z.string().min(1, required)),
        tanggal_cut_off: z.number().gte(1000000000, required),
        judul_stok_opname: z.string().min(1, required),
        jenis_stoks: z.array(z.string()),
        kategori_item: z.string().min(1, required),
        jenis_items: z.array(z.string()),
        lokasi_stok_uuid: z.string().min(1, required),
    });
}