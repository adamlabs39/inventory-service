import { z } from "zod";

export default class PengadaanValidation {
    static CREATE_PEMBELIAN_BARANG = z.object({
        faskes_uuid: z.string().uuid(),
        petugas_pembuat_po: z.string(),
        petugas_pembuat_po_uuid: z.string().uuid(),
        kategori_item: z.string(),
        jenis_stok_uuid: z.string().uuid(),
        jenis_item: z.string().min(1, "Jenis item wajib diisi"),
        supplier_uuid: z.string().uuid(),
        lokasi_stok_uuid: z.string().uuid(),
        tanggal_pembelian: z.number(),
        metode_pembelian: z.string(),
        catatan_po: z.string().optional(),
        is_cito: z.boolean().optional(),
        diskon: z.number().optional(),
        materai: z.number().optional(),
        ppn: z.number(),
        ongkos_kirim: z.number().optional(),
        items: z.array(z.object({
            item_uuid: z.string().uuid(),
            konversi_uuid: z.string().uuid(),
            qty_order: z.number().positive(),
            harga_satuan: z.number().positive(),
        })).min(1, "Minimal harus ada 1 item dalam pembelian"),
    }).strict();

    static GET_ALL_PEMBELIAN_BARANG = z.object({
        faskes_uuid: z.string().uuid(),
        no_po: z.string().optional(),
        filter: z.string().optional(), 
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    });

    static GET_PEMBELIAN_BARANG_BY_UUID = z.object({
        uuid: z.string().uuid(),
        faskes_uuid: z.string().uuid(),
    });

    static CANCEL_PEMBELIAN_BARANG = z.object({
        uuid: z.string().uuid(),
        faskes_uuid: z.string().uuid(),
        alasan_batal: z.string().min(1, "Alasan pembatalan wajib diisi"),
    });

    static UPDATE_PEMBELIAN_BARANG = z.object({
        uuid: z.string().uuid(),
        faskes_uuid: z.string().uuid(),
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
        ppn: z.number().optional(),
        lokasi_stok_uuid: z.string().uuid().optional(),
        items: z.array(z.object({
                item_uuid: z.string().uuid(),
                qty_order: z.number().positive(),
                harga_satuan: z.number().positive(),
                konversi_uuid: z.string().uuid(),
        })).min(1, "Minimal harus ada 1 item dalam pembelian").optional(),
    }).strict();

    static VERIFY_PEMBELIAN_BARANG = z.object({
        uuid: z.string().uuid("Format UUID tidak valid"),
        faskes_uuid: z.string().uuid("Format faskes_uuid tidak valid"),
    }).strict();
}