import axiosInstance from "../configurations/axios-instance.js";
import { farmasiApiConfig } from "../configurations/external-apis.js";
import InternalServerException from "../errors/internal-server-exception.js";

export default class LokasiGudangService {
    static async getLokasiGudang(options, originalReq) {
        try {
            const params = {
                jenis_lokasi: "gudang",
                name: options.search,
                page: options.page,
                limit: options.limit,
            };

            const token = originalReq.headers.authorization;

            const headers = {};

            if (token) {
                headers["Authorization"] = token;
            } else {
                console.warn("Warning: No authorization token found in original request to forward to Farmasi API.");
            }

            const response = await axiosInstance.get(`${farmasiApiConfig.baseURL}/datamaster/lokasi-stok`, {
                params: params,
                headers: headers,
            });

            if (response.status !== 200 || !response.data) {
                throw new Error("Gagal mengambil data dari API Farmasi atau format respons tidak sesuai.");
            }

            return {
                data: response.data.payload,
                pagination: response.data.properties,
            };
            
        } catch (error) {
            console.error("Error calling Farmasi API:", error.response?.data || error.message);
            throw new InternalServerException("Gagal menghubungi layanan Farmasi untuk mengambil data lokasi gudang.");
        }
    }
}