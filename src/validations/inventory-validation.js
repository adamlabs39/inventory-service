import { z } from "zod";
import {
  required,
  uuidRequired,
} from "./message-validation-error.js";

export default class InventoryValidation {
  static GET_FILTER = z.object({
    filter: z.string().min(1, "parameter harus disi dan sesuai"),
  });

  static DATA_SATUAN = z.object({
    uuid: z.string().min(1, uuidRequired),
  });

  static DELETE_SATUAN = z.object({
    uuid: z.string().min(1, uuidRequired),
  });

  static UPDATE_CARA_PAKAI = z.object({
    uuid: z.string().min(1, uuidRequired),
    status: z.boolean(),
    cara_pakai: z.string().min(1, required),
    code: z.string().min(1, required),
  });
}