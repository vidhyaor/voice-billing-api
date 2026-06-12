import type { Role } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const user = await request.server.prisma.user.findFirst({
    where: {
      id: request.user.sub,
      isActive: true,
    },
    select: { id: true },
  });

  if (!user) {
    throw new ForbiddenError("Account is inactive or not found");
  }
}

export function authorize(...allowedRoles: Role[]) {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
  };
}
