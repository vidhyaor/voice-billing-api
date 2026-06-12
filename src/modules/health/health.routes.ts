import type { FastifyPluginAsync } from "fastify";
import { env } from "../../config/env.js";
import { successResponse } from "../../utils/response.js";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check endpoint",
      },
    },
    async () =>
      successResponse({
        status: "ok",
        service: env.APP_NAME,
        version: env.APP_VERSION,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }),
  );
};

export default healthRoutes;
