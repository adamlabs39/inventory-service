import { z } from 'zod';
import DatamasterSupplierRepository from '../repositories/datamaster-supplier-repository.js';

async function isCodeUnique(code) {
    const existingSupplier = await DatamasterSupplierRepository.getCode(code);
    return existingSupplier === null;
}

export default class DatamasterSupplierValidation {
    static CREATE_SUPPLIER = z.object({
        faskes_uuid: z.string().min(1, "Faskes UUID wajib diisi"),
        status: z.boolean({ required_error: "Status wajib diisi" }),
        name: z.string({ required_error: "Nama supplier wajib diisi" }).min(1, "Nama supplier tidak boleh kosong"),
        code: z.string({ required_error: "Kode supplier wajib diisi" })
            .min(1, "Kode supplier tidak boleh kosong")
            .refine(isCodeUnique, { message: "Kode sudah digunakan" }),
        alamat: z.string({ required_error: "Alamat wajib diisi" }).min(1, "Alamat tidak boleh kosong"),
        kecamatan_code: z.string({ required_error: "Kecamatan wajib diisi" }).min(1, "Kecamatan tidak boleh kosong"),
        provinsi_code: z.string({ required_error: "Provinsi wajib diisi" }).min(1, "Provinsi tidak boleh kosong"),
        kabupaten_code: z.string({ required_error: "Kabupaten wajib diisi" }).min(1, "Kabupaten tidak boleh kosong"),
        kelurahan_code: z.string({ required_error: "Kelurahan wajib diisi" }).min(1, "Kelurahan tidak boleh kosong"),
        no_tlp: z.string({ required_error: "No. Telepon wajib diisi" }).min(1, "No. Telepon tidak boleh kosong"),
        supllier_items: z.array(z.object({
            kategori_item: z.string().min(1, "Kategori item tidak boleh kosong"),
        })).min(1, { message: "Daftar item supplier tidak boleh kosong" }),
    }).strict();

    static UPDATE_SUPPLIER = z.object({
        uuid: z.string().uuid("Format UUID tidak valid"),
        faskes_uuid: z.string().uuid("Format faskes_uuid tidak valid"),
        name: z.string().optional(),
        code: z.string().optional(),
        alamat: z.string().optional(),
        status: z.boolean().optional(),
        provinsi_code: z.string().optional(),
        kabupaten_code: z.string().optional(),
        kecamatan_code: z.string().optional(),
        kelurahan_code: z.string().optional(),
        no_tlp: z.string().optional(),
        supllier_items: z.array(z.object({ "kategori_item": z.string().min(1, "Kategori item wajib diisi")})).optional(),
    });

    static GET_SUPLLIER_BY_UUID = z.object({
        uuid: z.string().uuid({ message: "Format UUID tidak valid" }),
        faskes_uuid: z.string().uuid(),
    })

    static GET_ALL_SUPPLIER = z.object({
        faskes_uuid: z.string().uuid("Format faskes_uuid tidak valid"),
        name: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    });

    static GET_ALL_SUPPLIER_WITHOUT_PAGINATION = z.object({
        faskes_uuid: z.string().uuid("Format faskes_uuid tidak valid"),
        name: z.string().optional(),
    });

    static DELETE_SUPPLIER = z.object({
        uuid: z.string().uuid({ message: "Format UUID tidak valid" }),
        faskes_uuid: z.string().uuid({ message: "Format faskes_uuid tidak valid" }),
    });
}