export default class ExcelMapper {
    static mapStokOpname(data) {
        const result = {};
        const profile = data.slice(0, 4);

        result.nama_instansi = Object.keys(profile[0])[0];
        result.title = profile[1][Object.keys(profile[1])[0]];
        result.tanggal_cut_off = profile[2][Object.keys(profile[2])[0]];

        result.items = [];

        data.slice(4).forEach((item, index) => {
            const newItem = {};
            newItem.no = index + 1;
            newItem.kode_item = item["__EMPTY"];
            newItem.nama = item["__EMPTY_1"];
            newItem.kategori = item["__EMPTY_2"];
            newItem.jenis_item = item["__EMPTY_3"];
            newItem.jenis_stok = item["__EMPTY_4"];
            newItem.satuan = item["__EMPTY_5"];
            newItem.stok_awal = item["__EMPTY_6"];
            newItem.stok_masuk = item["__EMPTY_7"];
            newItem.stok_keluar = item["__EMPTY_8"];
            newItem.stok_sistem = item["__EMPTY_9"];
            newItem.stok_fisik = item["__EMPTY_10"];
            newItem.ed = item["__EMPTY_11"];
            newItem.harga_dasar = item["__EMPTY_12"];
            newItem.harga_akhir = item["__EMPTY_13"];
            newItem.id_stok = item["__EMPTY_14"];
            result.items.push(newItem);
        })


        return result;
    }
}