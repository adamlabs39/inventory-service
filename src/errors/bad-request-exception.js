export default class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.status = 400;
  }
}
