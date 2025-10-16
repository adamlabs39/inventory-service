import {z} from "zod";
import {required} from "./message-validation-error.js";

export default class PengeluaranUnitValidation {
    static CREATE = z.object({
        faskes_uuid: z.string().min(1, required),
        jenis_pengeluaran: z.string().min(1, required),
        jenis_item: z.string().min(1, required),
        kategori_item: z.string().min(1, required),
        jenis_stok_uuid: z.string().min(1, required),
        lokasi_stok_tujuan_uuid: z.string().min(1, required),
        tanggal_pengeluaran: z.number().min(1, required),
        petugas_pengeluaran: z.string().min(1, required),
        petugas_pengeluaran_uuid: z.string().min(1, required),
        items: z.array(z.object({
            stock_uuid: z.string().min(1, required),
            exp_date: z.string().min(1, required),
            harga_satuan: z.number().min(1, required),
            konversi_uuid: z.string().min(1, required),
            qty: z.number().min(1, required),
            stok_awal_lokasi_pengirim: z.number().min(1, required),
        }))
    });

    static CREATE_PEMUSNAHAN = z.object({
        jenis_pemusnahan: z.string().min(1, required),
    });

    static CREATE_PENGELUARAN_TANPA_PERMINTAAN = z.object({
        lokasi_stok_awal_uuid: z.string().min(1, required),
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