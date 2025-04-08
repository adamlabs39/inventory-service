import NotfoundException from "../errors/notfound-exception.js";
import BadRequestException from "../errors/bad-request-exception.js";
import errorResponse from "../responses/error-response.js";
import InternalServerException from "../errors/internal-server-exception.js";
import {UniqueConstraintError} from "sequelize";

const errorMiddleware = (error, request, response, nextFunction) => {
    if (error instanceof NotfoundException) {
        response.status(error.code).json(errorResponse(error.message, [{
            message: "data tidak ditemukan",
            type: "not found",
        }]));
    } else if (error instanceof BadRequestException) {
        response.status(error.status).json(errorResponse(error.message, error.errors));
    } else if (error instanceof InternalServerException) {
        response.status(error.code).json(errorResponse(error.message));
    } else if (error instanceof UniqueConstraintError) {
        const errors = error.errors.map((item) => {
            return {
                message: item.message,
                type: item.type,
            };
        });

        response.status(409).json(errorResponse(error.message, errors));
    }

    response.status(500).json(errorResponse(error.message));
};


export default errorMiddleware;
