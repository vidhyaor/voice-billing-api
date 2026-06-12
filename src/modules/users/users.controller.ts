import type { FastifyReply } from "fastify";
import { successResponse } from "../../utils/response.js";
import type { UsersService } from "./users.service.js";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  list = async (_request: unknown, reply: FastifyReply): Promise<void> => {
    const users = await this.usersService.list();
    reply.send(successResponse(users));
  };
}
