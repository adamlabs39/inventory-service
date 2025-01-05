import { KonfigurasiHargaModel } from "@adameds/model-sdk/farmasi";
import BadRequestException from "../errors/bad-request-exception";

export default class KonfigurasiHargaRepository {
    static async get(faskes_uuid) {
        const result = await KonfigurasiHargaModel.findOne({
            where: {
                faskes_uuid: faskes_uuid,
                deleted_at: null,
            },
        });

        if (!result) {
            throw new BadRequestException({ message: "Data tidak ditemukan" });
        }

        return result;
    }
}