import {optional, z} from "zod";
import {required} from "./message-validation-error.js";

export default class RiwayatMutasiValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        start_date: z.optional(z.string().min(1, required)),
        end_date: z.optional(z.string().min(1, required)),
        lokasi_stok_uuid: z.string().min(1, required),
    });

    static CREATE = z.object({
        faskes_uuid: z.string().min(1, required),
        with_check_stock: z.optional(z.boolean()),
        sumber_mutasi: z.string().min(1, required),
        petugas: z.string().min(1, required),
        code: z.string().min(1, required),
        keterangan: z.object({
            description: z.string().min(1, required),
            destination: optional(z.string().min(1, required)),
            source: optional(z.string().min(1, required)),
        }),
        items: z.array(z.object({
            type: z.string().min(1, required),
            item_uuid: z.string().min(1, required),
            exp_date: z.optional(z.string().min(1, required)),
            stok_awal: z.optional(z.number()),
            stok_mutasi: z.number(),
            lokasi_stok_uuid: z.string().min(1, required),
            jenis_stok_uuid: z.string().min(1, required),
        }))
    })
}