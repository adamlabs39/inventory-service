export default function errorResponse(message) {
  return {
    status: "error",
    message: message,
  };
}
