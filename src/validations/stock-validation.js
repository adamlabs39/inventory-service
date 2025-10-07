import { z } from 'zod';

export default class StockValidation {
    static GET_STOCK = z.object({
        faskes_uuid: z.string().uuid({ message: "faskes_uuid tidak valid" }),
        item_uuids: z.array(z.string().uuid({ message: "Setiap item_uuid harus berformat UUID yang valid" }))
        .min(1, "Minimal satu item_uuid harus diberikan"),
        lokasi_stok_uuid: z.string().uuid({ message: "lokasi_stok_uuid tidak valid" }).optional(),
    })
}