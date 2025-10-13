import { z } from 'zod';

export default class StockValidation {
    static GET_STOCK = z.object({
        faskes_uuid: z.string().uuid({ message: "faskes_uuid tidak valid" }),
        item_uuids: z.array(z.string().uuid({ message: "Setiap item_uuid harus berformat UUID yang valid" }))
        .min(1, "Minimal satu item_uuid harus diberikan"),
        lokasi_stok_uuid: z.string().uuid({ message: "lokasi_stok_uuid tidak valid" }).optional(),
    });

    static REDUCE_STOCK = z.object({
        item_uuid: z.string().uuid(),
        quantity: z.number().positive("Kuantitas harus lebih dari 0"),
        lokasi_stok_uuid: z.string().uuid(),
        jenis_stok_uuid: z.string().uuid(),
        sumber_mutasi: z.string().min(1),
        kode_referensi: z.string().min(1),
        faskes_uuid: z.string().uuid(),
        petugas: z.string().min(1, "Nama petugas wajib diisi"),
        keterangan: z.object({ description: z.string() }).optional()
    });

    static INCREASE_STOCK = z.object({
      faskes_uuid: z.string().uuid(),
      sumber_mutasi: z.string().min(1, "Sumber mutasi wajib diisi"),
      kode_referensi: z.string().min(1, "Kode referensi wajib diisi"),
      petugas: z.string().min(1, "Nama petugas wajib diisi"),
      items: z.array(z.object({
        item_uuid: z.string().uuid("Item UUID tidak valid"),
        lokasi_stok_uuid: z.string().uuid("Lokasi stok UUID tidak valid"),
        jenis_stok_uuid: z.string().uuid("Jenis stok UUID tidak valid"),
        quantity: z.number().int().positive("Kuantitas harus berupa angka positif"),
        exp_date: z.string().datetime("Format tanggal kedaluwarsa tidak valid"),
        harga_satuan: z.number().nonnegative("Harga satuan tidak boleh negatif"),
      })).min(1, "Minimal harus ada satu item yang ditambahkan"),
    });
}