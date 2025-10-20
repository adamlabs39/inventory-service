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
import ItemMedisRepository from "../repositories/item-medis-repository.js";
import ItemMedisJenisStokRepository from "../repositories/item-medis-jenis-stok-repository.js";
import InternalServerException from "../errors/internal-server-exception.js";
import SettingRepository from "../repositories/setting-repository.js";

export default class ReturSupplierService {
    static async getAll(payload) {
        const validatedReq = await ReturSupplierValidation.GET_ALL.parseAsync(payload);

        const result = await ReturSupplierRepository.getAll(validatedReq);

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
        });

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
        const validatedData = await ReturSupplierValidation.CREATE.parseAsync(req);

        const pembelian = await PengadaanBarangService.getDetail({
            uuid: validatedData.pembelian_supplier_uuid,
            faskes_uuid: validatedData.faskes_uuid,
        });

        if (!pembelian || !pembelian.uuid) {
            throw new NotfoundException("Data pembelian tidak ditemukan.");
        }

        if (!pembelian.lokasi_stok_uuid) {
            throw new NotfoundException("Lokasi Stok uuid tidak ditemukan di pembelian terkait");
        }

        const transaction = await sequelizeInstance.transaction();

        try {
            let ppnRate = 0;
            if (validatedData.ppn === true) {
                ppnRate = await SettingRepository.getCurrentPpnRate();
            }
            const returHeaderData = {
                ...validatedData,
                uuid: uuidv7(),
                no_retur_supplier: Utils.generate4Code("RTS"),
                lokasi_stok_uuid: pembelian.lokasi_stok_uuid,
                supplier_uuid: pembelian.supplier_uuid,
                status: "retur",
                ppn: ppnRate,
                tanggal_retur: validatedData.tanggal_retur || toEpochDate(Date.now()),
            };

            await ReturSupplierRepository.create(returHeaderData, transaction);

            const returItemsData = validatedData.items.map((item) => ({
                ...item,
                faskes_uuid: validatedData.faskes_uuid,
                retur_supplier_uuid: returHeaderData.uuid,
                item_type: "retur",
            }));

            await ReturSupplierRepository.createItems(returItemsData, transaction);

            await InventoryBarangRepository.changeReturnStatus({uuid: validatedData.pembelian_supplier_uuid}, transaction);

            const konfigurasiHarga = await KonfigurasiHargaRepository.get(validatedData.faskes_uuid);
            const mutasiItems = [];

            for (const item of returItemsData) {
                const itemDetail = await ItemMedisRepository.getByUuid({uuid: item.item_uuid});

                if (!itemDetail) {
                    throw new NotfoundException(`Item dengan uuid ${item.item_uuid} tidak ditemukan`);
                }

                const affectedStocks = await StockMedisRepository.reduceQuantity({
                    item_medis_uuid: item.item_uuid,
                    jenis_stok_uuid: pembelian.jenis_stok_uuid,
                    quantity: item.qty_retur,
                    metode_pemotongan_stok: konfigurasiHarga.metode_pemotongan_stok,
                    name: itemDetail.name,
                    lokasi_stok_uuid: pembelian.lokasi_stok_uuid
                }, transaction);

                for (const reducedStock of affectedStocks) {
                    mutasiItems.push({
                        item_uuid: item.item_uuid,
                        exp_date: reducedStock.expired_date,
                        stok_awal: reducedStock.previous_stock,
                        stok_mutasi: reducedStock.quantity,
                        jenis_stok_uuid: pembelian.jenis_stok_uuid,
                        lokasi_stok_uuid: pembelian.lokasi_stok_uuid,
                        type: "defisit"
                    });
                }
            }

            await RiwayatMutasiService.create({
                faskes_uuid: validatedData.faskes_uuid,
                sumber_mutasi: "inventory",
                with_check_stock: true,
                petugas: validatedData.petugas_retur,
                code: returHeaderData.no_retur_supplier,
                keterangan: { description: "Retur Supplier" },
                items: mutasiItems
            }, { transaction });

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async getAvailableFaktur(payload) {
        return await InventoryBarangRepository.getForRetur(payload);
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
            supplier: result.spplr?.name || "Nama Supplier Tidak Tersedia",
            lokasi_stok: result.lks?.name,
            lokasi_stok_uuid: result.lokasi_stok_uuid,
            jenis_item: result.jenis_item,
            kategori_item: result.kategori_item,
            jenis_stok: result.jenis_stok?.name,
            metode_pembelian: result.metode_pembelian,
            petugas_retur: req.petugas_retur,
            available_items: result.pbsu?.map((item) => {
                const formattedExpDate = item.exp_date
                    ? `${String(new Date(item.exp_date).getDate()).padStart(2, "0")}-${String(new Date(item.exp_date).getMonth() + 1).padStart(2, "0")}-${new Date(item.exp_date).getFullYear()}` : null;
                return {
                    item_uuid: item.item_uuid,
                    name: item.item_medis?.name,
                    satuan_beli: `${item.cnvrsn?.satuan_pembelian ?? "-"}/${
                        item.cnvrsn?.konversi ?? ""
                      } ${item.cnvrsn?.satuan_penggunaan ?? "-"}`,
                    satuan_penggunaan: item.cnvrsn?.satuan_penggunaan ?? "-",
                    konversi_uuid: item.konversi_uuid,
                    exp_date: formattedExpDate,
                    qty: item.qty_order,
                    harga_satuan: item.harga_satuan,
                };
            })
        };
    }

    static async acceptReplacement(payload) {
        const validatedData = await ReturSupplierValidation.ACCEPT_REPLACEMENT.parseAsync(payload);
        const searchParams = { uuid: validatedData.uuid, faskes_uuid: validatedData.faskes_uuid };
        
        const retur = await ReturSupplierRepository.getDetail(searchParams);

        if (!retur) {
            throw new NotfoundException(`Data retur dengan UUID ${validatedData.uuid} tidak ditemukan.`);
        }

        if (!retur.pembelian_supplier_uuid) {
            throw new InternalServerException("Properti 'pembelian_supplier_uuid' tidak ditemukan pada objek retur.");
        }        

        const pembelian = await PengadaanBarangService.getDetail({ uuid: retur.pembelian_supplier_uuid, faskes_uuid: validatedData.faskes_uuid });

        if (!pembelian) {
            throw new NotfoundException(`Data pembelian dengan UUID ${retur.pembelian_supplier_uuid} tidak ditemukan.`);
        }

        const transaction = await sequelizeInstance.transaction();

        const updateSupplierReq = {
            uuid: validatedData.uuid,
            status: "terima",
            jenis_penggantian: validatedData.type,
            tanggal_penggantian: validatedData.tanggal_penggantian || toEpochDate(Date.now()),
        };

        try {
            if (validatedData.type === "uang") {
                updateSupplierReq.total_pengembalian_uang = validatedData.harga;
            } else if (validatedData.type === "barang") {
                const itemsToCreate = validatedData.items.map((item) => ({
                    ...item,
                    faskes_uuid: validatedData.faskes_uuid,
                    retur_supplier_uuid: validatedData.uuid,
                    item_type: "replacement"
                }));

                await ReturSupplierRepository.createItems(itemsToCreate, transaction);

                const itemMedisUuids = validatedData.items.map(item => item.item_uuid);
                const itemJenisStokList  = await ItemMedisJenisStokRepository.getForPengadaanBarang({
                    item_medis_uuids: itemMedisUuids,
                    jenis_stok_uuid: pembelian.jenis_stok_uuid,
                    faskes_uuid: validatedData.faskes_uuid,
                });

                const itemJenisStokMap = new Map(
                    itemJenisStokList.map(item => [item.item_medis_uuid, item.uuid])
                );

                const stocks = itemsToCreate.map((item) => {
                    const itemJenisStokUuid = itemJenisStokMap.get(item.item_uuid);
                    if (!itemJenisStokUuid) {
                        throw new InternalServerException(`Konfigurasi jenis stok untuk item ${item.item_uuid} tidak ditemukan.`);
                    }
                    return {
                        ...item,
                        stok: item.qty_retur,
                        sisa_stok: item.qty_retur,
                        item_medis_jenis_stok_uuid: itemJenisStokUuid,
                        lokasi_stok_uuid: pembelian.lokasi_stok_uuid,
                        no_po: pembelian.no_po,
                    };
                });

                await StockMedisRepository.bulkCreate(stocks, transaction);
            }

            await ReturSupplierRepository.update(updateSupplierReq, transaction);

            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
}