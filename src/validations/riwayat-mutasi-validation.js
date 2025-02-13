import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class RiwayatMutasiValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        start_date: z.string().min(1, required),
        end_date: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
    });

    static CREATE = z.object({
        faskes_uuid: z.string().min(1, required),
        sumber_mutasi: z.string().min(1, required),
        petugas: z.string().min(1, required),
        code: z.string().min(1, required),
        keterangan: z.object(),
        items: z.array(z.object({
            item_uuid: z.string().min(1, required),
            exp_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: "exp_date harus dalam format YYYY-MM-DD",
            }),
            stok_awal: z.number(),
            stok_mutasi: z.number(),
            lokasi_stok_uuid: z.string().min(1, required),
            jenis_stok_uuid: z.string().min(1, required),
        }))

    })
}