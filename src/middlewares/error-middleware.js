import jwt from 'jsonwebtoken';
const { TokenExpiredError } = jwt;
import { ZodError } from "zod";
import { UniqueConstraintError } from "sequelize";
import errorResponse from "../responses/error-response.js";
import zodErrorParser from "../helpers/zod-error-parser.js";
import NotfoundException from "../errors/notfound-exception.js";
import BadRequestException from "../errors/bad-request-exception.js";
import InternalServerException from "../errors/internal-server-exception.js";

const errorMiddleware = (error, request, response, nextFunction) => {
  if (error instanceof NotfoundException) {
    return response
      .status(error.code)
      .json(errorResponse(error.message, error.errors));
  } else if (error instanceof ZodError) {
    const errors = zodErrorParser(error.issues); 
    return response.status(400).json(errorResponse("Validasi gagal", errors));
  } else if (error.name === 'AuthorizationSdkException') {
    const authErrorObject = error.message; 
    return response.status(error.code || 401).json(errorResponse(authErrorObject.message, authErrorObject.errors));
  } else if (error instanceof TokenExpiredError) {
    return response.status(401).json(errorResponse("Token expired"));
  } else if (error instanceof BadRequestException) {
    return response
      .status(error.status)
      .json(errorResponse(error.message, error.errors));
  } else if (error instanceof InternalServerException) {
    return response.status(error.code).json(errorResponse(error.message));
  } else if (error instanceof UniqueConstraintError) {
    const errors = error.errors.map((item) => {
      return {
        message: item.message,
        type: item.type,
      };
    });

    return response.status(409).json(errorResponse(error.message, errors));
  }

  return response.status(500).json(errorResponse(error.message));
};

export default errorMiddleware;
