import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class StokOpnameValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
    });

    static GET_STOCK_CARD = z.object({
        title: z.string().min(1, required),
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
        jenis_stok_uuids: z.array(z.string().min(1, required)),
        tanggal_cut_off: z.string().min(1, required),
        jenis_items: z.array(z.string().min(1, required)),
    });
}