export default class Utils {
    static camelToSnakeObject(obj, exclude = []) {
        const newObj = {};

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {

                if(exclude.includes(key)){
                    newObj[key] = obj[key];
                    continue;
                }

                const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                newObj[snakeCaseKey] = obj[key];
            }
        }

        return newObj;
    }

    static snakeToCamelObject(obj) {
        const newObj = {};

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const camelCaseKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
                newObj[camelCaseKey] = obj[key];
            }
        }

        return newObj;
    }

    static paginationHelper(page, limit, total) {
        const total_pages = Math.ceil(total / limit);
        const next = page < total_pages ? page + 1 : null;
        const prev = page > 1 ? page - 1 : null;
        return {
            page: parseInt(page),
            page_size: parseInt(limit),
            total_pages,
            total: total,
            next_page: next,
            prev_page: prev
        };
    }

    static pelayananToJenisStockCode(pelayanan){
        switch(pelayanan){
            case 'ri':
                return '0';
            case 'rj':
                return '1';
            case 'igd':
                return '2';
            case 'fisio':
                return '3';
            default:
                return '9';
        }
    }

    static nullToType(key, dataType = String) {
        if (key === null || key === undefined){
            switch (dataType)
            {
                case String:
                    return ''
                case Number:
                    return 0
                case Boolean:
                    return false
                case Object:
                    return {}
                case Array:
                    return []
                }
        }

        return key
    }

    static numberTo13Digit(num){
        if (num instanceof String){
            num = parseInt(num)
        }

        const power = (num.toString().length - 13) * -1

        return num * Math.pow(10, power)
    }

    static generate4Code(initialCode = ""){
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 4; i++) {
            initialCode += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return initialCode
    }
}