import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class StokAdjustmentValidation {
    static GET_DETAIL = z.object({
        uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
    });

    static UPDATE = z.object({
        uuid: z.string().min(1, required),
        sisa_stok: z.number().min(0, required),
        exp_date: z.string().min(1, required),
    });
}