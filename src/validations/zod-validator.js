import BadRequestException from "../errors/bad-request-exception.js";

export default class ZodValidator {
    static validate(schema, objectValidate) {
        try {
            return schema.parse(objectValidate);
        } catch (error) {
            const errors = error.errors.map((item) => {
                return {
                    message: `${item.path.join(".")} ${item.message}`,
                    field: item.path.join("."),
                };
            });

            throw new BadRequestException("Validasi gagal", errors);
        }
    }
}
