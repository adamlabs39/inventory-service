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
            newItem.code = item["__EMPTY"];
            newItem.name = item["__EMPTY_1"];
            newItem.category = item["__EMPTY_2"];
            newItem.item_type = item["__EMPTY_3"];
            newItem.stock_type = item["__EMPTY_4"];
            newItem.unit = item["__EMPTY_5"];
            newItem.physical_stock = item["__EMPTY_6"];
            newItem.expired_date = item["__EMPTY_7"];
            result.items.push(newItem);
        })


        return result;
    }
}