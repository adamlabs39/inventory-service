import express from "express";
import LokasiGudang from "../controllers/lokasi-gudang-controller.js";

const lokasiGudangRoutes = express.Router();

lokasiGudangRoutes.get(
    "/lokasi-gudang",
    LokasiGudang.getLokasiGudang,
);

export default lokasiGudangRoutes;