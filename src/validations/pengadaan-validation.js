import { z } from "zod";

export default class PengadaanValidation {
    static CREATE_PEMBELIAN_BARANG = z.object({
        faskes_uuid: z.string().uuid("Format faskes_uuid tidak valid"),
        petugas_pembuat_po: z.string(),
        petugas_pembuat_po_uuid: z.string().uuid("Format petugas_pembuat_po_uuid tidak valid"),
        kategori_item: z.string({ required_error: "Kategori item wajib diisi" }),
        jenis_stok_uuid: z.string().uuid("Format jenis_stok_uuid tidak valid"),
        jenis_item: z.string({ required_error: "Jenis item wajib diisi" }).min(1, "Jenis item tidak boleh kosong"),
        supplier_uuid: z.string().uuid("Format supplier_uuid tidak valid"),
        lokasi_stok_uuid: z.string({ required_error: "lokasi stok wajib diisi" }).uuid("Format lokasi_stok_uuid tidak valid"),
        tanggal_pembelian: z.number({ required_error: "Tanggal pembelian wajib diisi" }),
        metode_pembelian: z.string({ required_error: "Metode pembelian wajib diisi" }),
        catatan_po: z.string().optional(),
        is_cito: z.boolean().optional(),
        diskon: z.number({ invalid_type_error: "Diskon harus berupa angka" }).optional(),
        materai: z.number({ invalid_type_error: "Materai harus berupa angka" }).optional(),
        ppn: z.boolean({ required_error: "PPN wajib diisi"}),
        ongkos_kirim: z.number({ invalid_type_error: "Ongkos kirim harus berupa angka" }).optional(),
        items: z.array(z.object({
            item_uuid: z.string({ required_error: "Item wajib diisi" }).uuid("Format UUID item tidak valid"),
            konversi_uuid: z.string({ required_error: "Konversi wajib diisi" }).uuid("Format UUID konversi tidak valid"),
            qty_order: z.number({ 
                required_error: "Kuantitas order wajib diisi",
                invalid_type_error: "Kuantitas order harus berupa angka" 
            }).positive("Kuantitas order harus lebih dari 0"),
            harga_satuan: z.number({ 
                required_error: "Harga satuan wajib diisi",
                invalid_type_error: "Harga satuan harus berupa angka" 
            }).positive("Harga satuan harus lebih dari 0"),
        })).min(1, "Minimal harus ada 1 item dalam pembelian"),
    }).strict();

    static GET_ALL_PEMBELIAN_BARANG = z.object({
        faskes_uuid: z.string().uuid(),
        lokasi_stok_uuid: z.string()
            .min(1, "Lokasi Stok tidak boleh kosong"),
        no_po: z.string().optional(),
        filter: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    });

    static GET_PEMBELIAN_BARANG_BY_UUID = z.object({
        uuid: z.string().uuid({ message: "Format UUID pembelian barang tidak valid." }),
        faskes_uuid: z.string().uuid({ message: "Format faskes_uuid tidak valid." }),
    });

    static CANCEL_PEMBELIAN_BARANG = z.object({
        uuid: z.string().uuid({ message: "Format UUID pembelian barang tidak valid." }),
        faskes_uuid: z.string().uuid({ message: "Format faskes_uuid tidak valid." }),
        alasan_batal: z.string().min(1, "Alasan pembatalan wajib diisi"),
    });

    static UPDATE_PEMBELIAN_BARANG = z.object({
        uuid: z.string().uuid({ message: "Format UUID pembelian barang tidak valid." }),
        faskes_uuid: z.string().uuid({ message: "Format faskes_uuid tidak valid." }),
        kategori_item: z.string().optional(),
        jenis_stok_uuid: z.string().uuid().optional(),
        jenis_item: z.string().optional(),
        supplier_uuid: z.string().uuid().optional(),
        tanggal_pembelian: z.number().optional(),
        metode_pembelian: z.string().optional(),
        catatan_po: z.string().optional(),
        is_cito: z.boolean().optional(),
        diskon: z.number().optional(),
        materai: z.number().optional(),
        ppn: z.boolean().optional(),
        lokasi_stok_uuid: z.string().uuid().optional(),
        items: z.array(z.object({
                item_uuid: z.string().uuid(),
                qty_order: z.number().positive(),
                harga_satuan: z.number().positive(),
                konversi_uuid: z.string().uuid(),
        })).min(1, "Minimal harus ada 1 item dalam pembelian").optional(),
    }).strict();

    static VERIFY_PEMBELIAN_BARANG = z.object({
        uuid: z.string().uuid({ message: "Format UUID tidak valid" }),
        faskes_uuid: z.string().uuid({ message: "Format faskes_uuid tidak valid" }),
    }).strict();
}