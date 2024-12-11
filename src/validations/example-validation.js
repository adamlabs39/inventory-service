import {z} from "zod";
import {faskesUuidRequired, required} from "./message-validation-error.js";

export default class ExampleValidation {
    static ORDER_ALKES = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        no_reg: z.string().min(1, required),
        patient_uuid: z.string().min(1, required),
        no_rm: z.string().min(1, required),
        jenis_pelayanan: z.string().min(1, required),
        rekam_medis_uuid: z.string().min(1, required),
        petugas_order: z.string().min(1, required),
        rekam_medis_date: z.string().min(1, required),
        lokasi_uuid : z.string().min(1, required),
        payment_method : z.number(),
    });
}