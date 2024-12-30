import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PermintaanUnitValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        status : z.string().min(1, required),
    });
}