export default class NotfoundException extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.code = 404;
    this.errors = [
      {
        type: "notfound",
        message: message,
      },
    ];
  }
}
