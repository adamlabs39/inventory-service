import BadRequestException from "../errors/bad-request-exception.js";

export default class ZodValidator {
    static validate(schema, objectValidate) {
        try {
            return schema.parse(objectValidate);
        } catch (error) {
            const errorMessage = error.errors.map((err) => {
                return `${err.path} ${err.message}`;
            });

            throw new BadRequestException(errorMessage);
        }
    }
}
