import NotfoundException from "../errors/notfound-exception.js";
import BadRequestException from "../errors/bad-request-exception.js";
import errorResponse from "../responses/error-response.js";
import {UniqueConstraintError} from "sequelize";
import UnauthorizedException from "../errors/unauthorized-exception.js";
import DuplicateException from "../errors/duplicate-exception.js";
import { ZodError } from "zod";
import zodErrorParser from "../helpers/zod-error-parser.js";
import InternalServerException from "../errors/internal-server-exception.js";

const errorMiddleware = (error, request, response, nextFunction) => {
    if (error instanceof NotfoundException) {
        return response.status(error.code).json(errorResponse("Data tidak ditemukan", error.errors));
    } else if (error instanceof UnauthorizedException) {
        return response.status(error.code).json(errorResponse(error.message));
    } else if (error instanceof BadRequestException) {
        response.status(error.status).json(errorResponse("Permintaan tidak valid", error.errors));
    } else if (error instanceof DuplicateException) {
        response.status(error.code).json(errorResponse(error.message, error.errors));
    } else if (error instanceof UniqueConstraintError) {
        response.status(400).json(errorResponse("Duplicate Data", error.errors));
    } else if (error instanceof ZodError) {
        response.status(400).json(errorResponse("Validasi gagal", zodErrorParser(error.errors)));
    } else if (error instanceof InternalServerException) {
        response.status(error.code).json(errorResponse(error.message));
    } else {
        response.status(500).json(
        errorResponse("Internal Server Error", [
            {
            type: "internal server error",
            message: error.message,
            },
        ])
        );
    }
};


export default errorMiddleware;