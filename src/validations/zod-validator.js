export default class ZodValidator {
    static async validate(schema, objectValidate) {
        try {
            return await schema.parseAsync(objectValidate);
        } catch (error) {
            throw error;
        }
    }
}
