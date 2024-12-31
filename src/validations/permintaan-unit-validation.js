import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PermintaanUnitValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        status : z.string().min(1, required),
    });

    static GET_DETAIL = z.object({
      uuid: z.string().min(1, required)
    })

    static TOLAK_PERMINTAAN = z.object({
        uuid: z.string().min(1, required),
        alasan_batal: z.string().min(1, required),
        petugas_batal_tolak: z.string().min(1, required)
    })
}