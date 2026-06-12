import { Prisma } from "@prisma/client";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "./errors.js";

interface PrismaErrorMap {
  P2002?: string;
  P2003?: string;
  P2025?: string;
}

export function handlePrismaError(
  error: unknown,
  messages: PrismaErrorMap = {},
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        throw new ConflictError(
          messages.P2002 ?? "A record with this value already exists",
        );
      case "P2003":
        throw new NotFoundError(
          messages.P2003 ?? "Related resource not found",
        );
      case "P2025":
        throw new NotFoundError(messages.P2025 ?? "Resource not found");
      default:
        break;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new ValidationError("Invalid data provided");
  }

  throw error;
}
