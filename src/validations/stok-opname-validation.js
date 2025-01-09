import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class StokOpnameValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
    });
}