import sequelizeInstance from "@adameds/model-sdk/instance";
import PenerimaanUnitSeeder from "./penerimaan-unit-seeder.js";

export const dbSeeder = async () => {
    const transaction = await sequelizeInstance.transaction();
    try {

        // PENERIMAAN BARANG UNIT
        await PenerimaanUnitSeeder.seed(transaction);

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};