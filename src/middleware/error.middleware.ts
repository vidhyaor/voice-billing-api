import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants/index.js";
import { AppError } from "../utils/errors.js";
import type { ApiErrorResponse } from "../types/api.types.js";

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  request.log.error(error);

  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };

    reply.status(error.statusCode).send(response);
    return;
  }

  if (error instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: "Validation failed",
        code: ERROR_CODES.VALIDATION_ERROR,
        details: error.flatten(),
      },
    };

    reply.status(400).send(response);
    return;
  }

  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : 500;

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message:
        env.NODE_ENV === "production" && statusCode === 500
          ? "Internal server error"
          : error.message,
      code: ERROR_CODES.INTERNAL_ERROR,
    },
  };

  reply.status(statusCode).send(response);
}
