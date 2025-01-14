import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PenerimaanReturValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_tujuan_uuid: z.string().min(1, required),
    });

    static GET_DETAIL = z.object({
        uuid: z.string().min(1, required),
    });
}