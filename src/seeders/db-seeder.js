import sequelizeInstance from "@adameds/model-sdk/instance";
import PenerimaanUnitSeeder from "./penerimaan-unit-seeder.js";
import PengeluaranUnitSeeder from "./pengeluaran-unit-seeder.js";
import RiwayatMutasiSeeder from "./riwayat-mutasi-seeder.js";
import StokOpnameSeeder from "./stok-opname-seeder.js";
import PenerimaanReturSeeder from "./penerimaan-retur-seeder.js";
import DatamasterSupplierSeeder from "./datamaster-supplier-seeder.js";

export const dbSeeder = async () => {
    const transaction = await sequelizeInstance.transaction();
    try {

        await PenerimaanUnitSeeder.seed(transaction);
        await PengeluaranUnitSeeder.seed(transaction);
        await RiwayatMutasiSeeder.seed(transaction);
        await StokOpnameSeeder.seed(transaction);
        await PenerimaanReturSeeder.seed(transaction);
        await DatamasterSupplierSeeder.seed(transaction);

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};