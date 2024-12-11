import sequelizeInstance from "@adameds/model-sdk/instance";
import ExampleSeeder from "./example-seeder.js";

export const dbSeeder = async () => {
    const transaction = await sequelizeInstance.transaction();
    try {
        await ExampleSeeder.seed(transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};