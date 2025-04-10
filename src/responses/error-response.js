export default function errorResponse(message, errors) {
    return {
        message: message,
        errors
    };
}
