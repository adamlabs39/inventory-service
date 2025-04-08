import ReturSupplierRepository from "../repositories/retur-supplier-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import ReturSupplierValidation from "../validations/retur-supplier-validation.js";
import NotfoundException from "../errors/notfound-exception.js";
import PengadaanBarangService from "./pengadaan-barang-service.js";
import Utils from "../helpers/utils.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import {uuidv7} from "uuidv7";
import {toEpochDate} from "../helpers/date-helper.js";
import InventoryBarangRepository from "../repositories/inventory-barang-repository.js";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import KonfigurasiHargaRepository from "../repositories/konfigurasi-harga-repository.js";
import RiwayatMutasiService from "./riwayat-mutasi-service.js";

export default class ReturSupplierService {
    static async getALl(req) {
        ZodValidator.validate(ReturSupplierValidation.GET_ALL, req);

        const result = await ReturSupplierRepository.getAll(req);

        if (!result.data) {
            throw new NotfoundException("Data tidak ada yang cocok");
        }

        result.data = result.data.map((item) => {
            return {
                uuid: item.uuid,
                supplier: item.spplr?.name,
                no_retur_supplier: item.no_retur_supplier,
                tanggal_retur: item.tanggal_retur,
                petugas: item.petugas_retur,
                status: item.status,
                jenis_stok: item.pembelian_barang_supplier?.jenis_stok?.name,
                jenis_item: item.pembelian_barang_supplier?.jenis_item,
                kategori_item: item.pembelian_barang_supplier?.kategori_item,
            };
        })

        return result;
    }

    static async getDetail(req) {
        ZodValidator.validate(ReturSupplierValidation.GET_DETAIL, req);

        const result = await ReturSupplierRepository.getDetail(req);

        if (!result) {
            throw new NotfoundException("Data tidak ditemukan");
        }

        let items = [];

        if (result.items) {
            for (let item of result.items) {
                if (item.item_type === "retur" && result.status === "retur") {
                    items.push({
                        name: item.item_medis?.name,
                        item_uuid: item.item_uuid,
                        exp_date: item.exp_date,
                        qty: item.qty_retur,
                        konversi: `${item.konversi?.satuan_pembelian ?? "-"}/${item.konversi?.konversi ?? ""} ${item.konversi?.satuan_penggunaan ?? "-"}`,
                        konversi_uuid: item.konversi_uuid,
                        harga: item.harga_satuan
                    });
                } else if (item.item_type === "replacement" && result.status === "terima") {
                    items.push({
                        name: item.item_medis?.name,
                        item_uuid: item.item_uuid,
                        exp_date: item.exp_date,
                        qty: item.qty_retur,
                        konversi: `${item.konversi?.satuan_pembelian ?? "-"}/${item.konversi?.konversi ?? ""} ${item.konversi?.satuan_penggunaan ?? "-"}`,
                        konversi_uuid: item.konversi_uuid,
                        harga: item.harga_satuan
                    });
                }
            }
        }

        let grandTotal = "-";
        if (items || result.total_pengembalian_uang) {
            grandTotal = items.reduce((acc, item) => acc + (item.qty * item.harga), 0);
            grandTotal = grandTotal + (result.ppn ? grandTotal * (11 / 100) : 0) - (result.diskon ?? 0) + (result.materai ?? 0);
        }

        return {
            uuid: result.uuid,
            no_retur_supplier: result.no_retur_supplier,
            status: result.status,
            no_penerimaan: result.pembelian_barang_supplier?.no_po,
            tanggal_penerimaan: result.pembelian_barang_supplier?.tanggal_penerimaan,
            no_faktur: result.pembelian_barang_supplier?.no_faktur,
            tanggal_faktur: result.pembelian_barang_supplier?.tanggal_faktur,
            tanggal_retur: result.tanggal_retur,
            lokasi_gudang: result.pembelian_barang_supplier?.lks?.name,
            alasan_retur: result.alasan_retur,
            catatan: result.catatan,
            supplier: result.spplr?.name,
            jenis_item: result.pembelian_barang_supplier?.jenis_item,
            kategori_item: result.pembelian_barang_supplier?.kategori_item,
            jenis_stok: result.pembelian_barang_supplier?.jenis_stok?.name,
            jenis_pembayaran: result.pembelian_barang_supplier?.metode_pembelian,

            petugas_retur: result.petugas_retur,
            diskon: result.diskon,
            materai: result.materai,
            ppn: result.ppn,
            grand_total: grandTotal,
            total_item: items.length === 0 ? "-" : `${items.length} item`,
            items,
            jenis_penggantian: result.jenis_penggantian,
            tanggal_penggantian: result.tanggal_penggantian,
            nominal_penggantian: result.total_pengembalian_uang,
        };
    }

    static async create(req) {
        ZodValidator.validate(ReturSupplierValidation.CREATE, req);
        const transaction = await sequelizeInstance.transaction();

        const pembelian = await PengadaanBarangService.getDetail({uuid: req.pembelian_supplier_uuid});

        if (!pembelian.lokasi_stok_uuid) {
            throw new NotfoundException("Lokasi Stok uuid tidak ditemukan di pembelian terkait");
        }

        req.lokasi_stok_uuid = pembelian.lokasi_stok_uuid;
        req.status = 'retur';
        req.supplier_uuid = pembelian.supplier_uuid;
        req.no_retur_supplier = Utils.generate4Code("RTS");
        req.uuid = uuidv7();
        req.ppn = req.ppn ? 11 : 0;

        if (!req.tanggal_retur) {
            req.tanggal_retur = toEpochDate(Date.now());
        }

        try {
            await ReturSupplierRepository.create(req, transaction);

            if (req.items) {
                req.items = req.items.map((item) => {
                    return {
                        ...item,
                        faskes_uuid: req.faskes_uuid,
                        retur_supplier_uuid: req.uuid,
                        item_type: "retur"
                    }
                })
            }

            await ReturSupplierRepository.createItems(req.items, transaction);

            await InventoryBarangRepository.changeReturnStatus({uuid: req.pembelian_supplier_uuid}, transaction);

            const konfigurasiHarga = await KonfigurasiHargaRepository.get(req.faskes_uuid);
            const mutasiItems = [];

            for (const item of req.items) {
                const items = await StockMedisRepository.reduceQuantity({
                    item_medis_uuid: item.item_uuid,
                    jenis_stok_uuid: pembelian.jenis_stok_uuid,
                    quantity: item.qty_pengiriman,
                    metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok,
                    name: item.item_medis.name,
                    lokasi_stok_uuid: pembelian.lokasi_stok_uuid
                }, transaction);

                for (const reducedStock of items) {
                    mutasiItems.push({
                        item_uuid: item.item_uuid,
                        exp_date: reducedStock.expired_date,
                        stok_awal: reducedStock.previous_stock,
                        stok_mutasi: reducedStock.quantity,
                        jenis_stok_uuid: pembelian.jenis_stok_uuid,
                        lokasi_stok_uuid: pembelian.lokasi_stok_uuid,
                        type: "defisit"
                    })
                }
            }

            await RiwayatMutasiService.create({
                faskes_uuid: req.faskes_uuid,
                sumber_mutasi: "inventory",
                with_check_stock: true,
                petugas: req.petugas_retur,
                code: req.no_retur_supplier,
                keterangan: {
                    description: "Retur Supplier",
                },
                items: mutasiItems
            })


            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async getAvailableFaktur(req) {
        if (req.date) {
            const [day, month, year] = req.date.split('-').map(Number);

            const start = new Date(year, month - 1, day, 0, 0, 0);
            const end = new Date(year, month - 1, day, 23, 59, 59, 999);

            req.start_date = toEpochDate(start);
            req.end_date = toEpochDate(end);
        }

        const result = await InventoryBarangRepository.getForRetur(req);

        if (!result.data || result.data.length === 0) {
            throw new NotfoundException("Tidak ada data yang cocok");
        }

        result.data = result.data.map((item) => {
            return {
                uuid: item.uuid,
                no_faktur: item.no_faktur,
                tanggal_faktur: item.tanggal_faktur,
                no_penerimaan: item.no_po,
                tanggal_penerimaan: item.tanggal_penerimaan,
                supplier: item.supplier?.name,
            }
        })

        return result;
    }

    static async getFakturDetail(req) {
        const result = await InventoryBarangRepository.getDetail(req);

        if (!result) {
            throw new NotfoundException("Data dengan ID ini tidak ditemukan");
        }

        if (result.is_return) {
            throw new NotfoundException("Data ini sudah di retur");
        }

        return {
            uuid: result.uuid,
            no_faktur: result.no_faktur,
            tanggal_faktur: result.tanggal_faktur,
            no_penerimaan: result.no_po,
            tanggal_penerimaan: result.tanggal_penerimaan,
            supplier: result.spplr?.name,
            lokasi_stok: result.lks?.name,
            lokasi_stok_uuid: result.lokasi_stok_uuid,
            jenis_item: result.jenis_item,
            kategori_item: result.kategori_item,
            jenis_stok: result.jenis_stok?.name,
            metode_pembelian: result.metode_pembelian,
            petugas_retur: req.petugas_retur,
            available_items: result.pbsu?.map((item) => {
                return {
                    item_uuid: item.item_uuid,
                    name: item.item_medis?.name,
                    konversi: `${item.konversi?.satuan_pembelian ?? "-"}/${item.konversi?.konversi ?? "-"}`,
                    satuan_penggunaan: item.konversi?.satuan_penggunaan,
                    konversi_uuid: item.konversi_uuid,
                    exp_date: `${String(item.exp_date.getDate()).padStart(2, '0')}-${String(item.exp_date.getMonth() + 1).padStart(2, '0')}-${item.exp_date.getFullYear()}`,
                    qty: item.qty_terima,
                    harga_satuan: item.harga_satuan,
                }
            })
        }
    }

    static async acceptReplacement(req) {
        ZodValidator.validate(ReturSupplierValidation.REPLACEMENT_TYPE, req);

        if (!req.tanggal_penggantian) {
            req.tanggal_penggantian = toEpochDate(Date.now());
        }

        const retur = await ReturSupplierRepository.getDetail({uuid: req.uuid});

        if (!retur) {
            throw new NotfoundException("Data retur dengan id ini tidak ditemukan");
        }

        const pembelian = await PengadaanBarangService.getDetail({uuid: retur.pembelian_supplier_uuid});

        const transaction = await sequelizeInstance.transaction();

        const updateSupplierReq = {
            uuid: req.uuid,
            status: "terima",
            jenis_penggantian: req.type,
            tanggal_penggantian: req.tanggal_penggantian,
        }

        try {
            if (req.type === "uang") {
                ZodValidator.validate(ReturSupplierValidation.REPLACEMENT_PRICE, req);
                updateSupplierReq.total_pengembalian_uang = req.harga;
            } else if (req.type === "barang") {
                ZodValidator.validate(ReturSupplierValidation.REPLACEMENT_ITEM, req.items);

                req.items = req.items.map((item) => {
                    return {
                        ...item,
                        faskes_uuid: req.faskes_uuid,
                        retur_supplier_uuid: req.uuid,
                        item_type: "replacement"
                    }
                })

                await ReturSupplierRepository.createItems(req.items, transaction);

                const stocks = req.items.map((item) => {
                    return {
                        ...item,
                        stok: item.qty_retur,
                        sisa_stok: item.qty_retur,
                        item_medis_jenis_stok_uuid: "", // TODO : GET THIS UUID
                        lokasi_stok_uuid: pembelian.lokasi_stok_uuid,
                        no_po: pembelian.no_po,
                    }
                });

                await StockMedisRepository.bulkCreate(stocks, transaction);

                // TODO : LOG TO TABLE HISTORI MUTASI
            }

            await ReturSupplierRepository.update(updateSupplierReq, transaction);

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
}