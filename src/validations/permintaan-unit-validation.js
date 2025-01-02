import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PermintaanUnitValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        status : z.string().min(1, required),
        lokasi_gudang_uuid: z.string().min(1, required),
    });

    static GET_DETAIL = z.object({
      uuid: z.string().min(1, required)
    })

    static TOLAK_PERMINTAAN = z.object({
        uuid: z.string().min(1, required),
        alasan_batal: z.string().min(1, required),
        petugas_batal_tolak: z.string().min(1, required)
    })

    static VERIFIKASI_PERMINTAAN = z.object({
        uuid: z.string().min(1, required),
        item : z.object({
            uuid: z.string().min(1, required),
            quantity: z.number().min(1, {message: "jumlah pengiriman harus lebih dari 0",
            })
        }),
        petugas_verifikasi: z.string().min(1, required)
    })

    static KIRIM_PERMINTAAN = z.object({
        uuid: z.string().min(1, required),
        petugas_kirim: z.string().min(1, required)
    })
}