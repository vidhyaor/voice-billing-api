import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

type RequestPart = "body" | "query" | "params";

export function validate<T>(schema: ZodSchema<T>, part: RequestPart = "body") {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {
    const data = request[part];
    const result = schema.safeParse(data);

    if (!result.success) {
      const message = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      throw new ValidationError(message);
    }

    if (part === "body") {
      request.body = result.data;
    } else if (part === "query") {
      request.query = result.data as typeof request.query;
    } else {
      request.params = result.data as typeof request.params;
    }
  };
}
