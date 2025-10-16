import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PenerimaanValidation {
    static CREATE_PENERIMAAN_BARANG = z.object({
        uuid: z.string().uuid("UUID PO tidak valid"),
        faskes_uuid: z.string().uuid(),
        petugas_penerima_uuid: z.string().uuid(),
        petugas_penerima: z.string(),
        petugas_pengirim: z.string().optional(),
        no_faktur: z.string().min(1, "Nomor faktur wajib diisi"),
        tanggal_faktur: z.number({ required_error: "Tanggal faktur wajib diisi" }),
        tanggal_terima: z.number({ required_error: "Tanggal terima wajib diisi" }),
        no_surat_jalan: z.string({ required_error: "Nomor surat jalan wajib diisi" }),
        catatan_penerimaan: z.string().optional(),
        diskon: z.number().optional(),
        materai: z.number().optional(),
        ppn: z.number().optional(),
        items: z.array(z.object({
            uuid: z.string().uuid("UUID item pembelian tidak valid"),
            qty_terima: z.number().nonnegative("Jumlah diterima tidak boleh negatif"),
            exp_date: z.number({ required_error: "Tanggal kedaluwarsa wajib diisi" }),
        })).min(1, "Minimal ada 1 item yang diterima"),
    }).strict();

    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, required),
        lokasi_stok_tujuan_uuid: z.string().min(1, required),
    });

    static GET_DETAIL = z.object({
        uuid: z.string().min(1, required),
    });
}