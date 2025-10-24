import {optional, z} from "zod";
import {required} from "./message-validation-error.js";

export default class RiwayatMutasiValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().uuid(required), 
        lokasi_stok_uuid: z.string().uuid().optional(),
        code: z.string().optional(), 
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        jenis_stok_uuid: z.string().uuid().optional(),
        jenis_item: z.string().optional(), 
        search: z.string().optional(),
        page: z.string().optional(), 
        limit: z.string().optional()
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
            exp_date: z.optional(z.date().or(z.string().min(1, required))),
            stok_awal: z.optional(z.number()),
            stok_mutasi: z.number(),
            lokasi_stok_uuid: z.string().min(1, required),
            jenis_stok_uuid: z.string().min(1, required),
        }))
    });
}