export default class BadRequestException extends Error {
  constructor(errors) {
    super("Bad Request");
    this.status = 400;
    if (typeof errors === 'string') {
      this.errors = [{ message: errors }];
    } else {
      this.errors = errors;
    }
  }
}