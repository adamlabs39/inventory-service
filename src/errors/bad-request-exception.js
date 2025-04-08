export default class BadRequestException extends Error {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.message = message;
        this.status = 400;
    }
}