import {z} from "zod";
import {faskesUuidRequired, required} from "./message-validation-error.js";

export default class ReturSupplierValidation {
    static GET_ALL = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        search: z.string().optional(),
        status: z.enum(["retur", "terima"]),
    })

    static GET_DETAIL = z.object({
        uuid: z.string().min(1, required),
    });

    static CREATE = z.object({
        faskes_uuid: z.string().min(1, faskesUuidRequired),
        petugas_retur: z.string().min(1, required),
        alasan_retur: z.number(),
        pembelian_supplier_uuid: z.string().min(1, required),
        diskon: z.number().optional(),
        materai: z.number().optional(),
        ppn: z.boolean(),
        catatan: z.string().optional(),
        tanggal_retur: z.number().optional(),
        petugas_retur_uuid: z.string().min(1, required),
        items: z.array(z.object({
            item_uuid: z.string().min(1, required),
            qty_retur: z.number().min(1, required),
            konversi_uuid: z.string().optional(),
            harga_satuan: z.number().min(1, required),
            exp_date: z.string().optional(),
        })).optional()
    })

    static ACCEPT_REPLACEMENT = z.object({
        type: z.enum(["barang", "uang"], {
            required_error: "Field 'type' wajib diisi. Pilih antara 'barang' atau 'uang'.",
        }),
        faskes_uuid: z.string({ required_error: "faskes_uuid tidak ditemukan dari token." }),
        uuid: z.string({ required_error: "UUID retur pada path parameter wajib diisi." }),
        tanggal_penggantian: z.number().optional(),
        items: z.array(z.object({
            item_uuid: z.string({ required_error: "UUID item pada array wajib diisi." }),
            qty_retur: z.number({ invalid_type_error: "qty_retur harus berupa angka." }).min(1, "Jumlah retur minimal 1"),
            konversi_uuid: z.string({ required_error: "konversi_uuid wajib diisi untuk setiap item" }),
            harga_satuan: z.number({ invalid_type_error: "harga_satuan harus berupa angka." }).min(1, "Harga satuan minimal 1"),
            exp_date: z.string().optional(),
        })).optional(),
        harga: z.number({ invalid_type_error: "harga harus berupa angka." }).optional(),

    }).superRefine((data, ctx) => {
        if (data.type === 'barang') {
            if (!data.items || data.items.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["items"],
                    message: "Jika type adalah 'barang', field 'items' wajib diisi dan tidak boleh kosong.",
                });
            }
        } else if (data.type === 'uang') {
            if (data.harga === undefined || data.harga === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["harga"],
                    message: "Jika type adalah 'uang', field 'harga' wajib diisi.",
                });
            }
        }
    });
}