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

    static REPLACEMENT_TYPE = z.object({
        type: z.enum(["barang", "uang"]),
        faskes_uuid: z.string().min(1, required),
        tanggal_penggantian: z.number().optional(),
        uuid: z.string().min(1, required),
    });

    static REPLACEMENT_ITEM = z.array(z.object({
        item_uuid: z.string().min(1, required),
        qty_retur: z.number().min(1, required),
        konversi_uuid: z.string().optional(),
        harga_satuan: z.number().min(1, required),
    }));

    static REPLACEMENT_PRICE = z.object({
        harga: z.number().min(1, required),
    })
}