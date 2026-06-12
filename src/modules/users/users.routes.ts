import { Role } from "@prisma/client";
import type { FastifyPluginAsync } from "fastify";
import { authenticate, authorize } from "../../middleware/index.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  const usersService = new UsersService(fastify);
  const usersController = new UsersController(usersService);

  fastify.get(
    "/",
    {
      preHandler: [authenticate, authorize(Role.ADMIN, Role.MANAGER)],
      schema: {
        tags: ["Users"],
        summary: "List all users",
        security: [{ bearerAuth: [] }],
      },
    },
    usersController.list,
  );
};

export default usersRoutes;
