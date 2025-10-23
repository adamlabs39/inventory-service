import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PengeluaranUnitValidation {
    static CREATE = z.object({
        faskes_uuid: z.string().uuid(required),
        jenis_pengeluaran: z.enum(["pemakaian unit", "pengeluaran tanpa permintaan", "pemusnahan barang"], { required_error: required }),
        jenis_item: z.string().min(1, required),
        kategori_item: z.string().min(1, required),
        jenis_stok_uuid: z.string().uuid(required),
        lokasi_stok_tujuan_uuid: z.string().uuid(required),
        tanggal_pengeluaran: z.number().positive(required),
        petugas_pengeluaran: z.string().min(1, required),
        petugas_pengeluaran_uuid: z.string().uuid(required),
        catatan: z.string().optional(), 
        items: z.array(z.object({
            stock_uuid: z.string().uuid(required),
            exp_date: z.string().min(1, required), 
            harga_satuan: z.number().positive(required),
            konversi_uuid: z.string().uuid(required),
            qty: z.number().int().positive(required),
        })).min(1, "Minimal harus ada 1 item")
    });

    static CREATE_PEMUSNAHAN = PengeluaranUnitValidation.CREATE.extend({
        jenis_pemusnahan: z.enum(["rusak", "kadaluarsa"], { required_error: required }),
    });

    static CREATE_PENGELUARAN_TANPA_PERMINTAAN = PengeluaranUnitValidation.CREATE.extend({
        lokasi_stok_awal_uuid: z.string().uuid("Lokasi stok awal wajib diisi"), 
    });

    static GET_AVAILABLE_STOCK = z.object({
        tanggal_pengeluaran: z.string().min(1, required),
        jenis_stok_uuid: z.string().min(1, required),
        lokasi_stok_uuid: z.string().min(1, required),
        jenis_item: z.string().min(1, required),
    });

    static GET_ALL = z.object({
        faskes_uuid: z.string().uuid("faskes_uuid tidak valid"),
        lokasi_stok_uuid: z.string()
            .min(1, "Lokasi Stok tidak boleh kosong")
            .optional(),
        search: z.string().optional(),
    });

    static GET_DETAIL = z.object({
        uuid: z.string().min(1, required),
    });
}