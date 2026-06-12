import Fastify from "fastify";
import { env } from "./config/env.js";
import { ERROR_CODES } from "./constants/index.js";
import registerModules from "./modules/index.js";
import { errorHandler } from "./middleware/index.js";
import corsPlugin from "./plugins/cors.js";
import jwtPlugin from "./plugins/jwt.js";
import prismaPlugin from "./plugins/prisma.js";
import swaggerPlugin from "./plugins/swagger.js";
import "./types/jwt.types.js";
import { buildLoggerConfig } from "./utils/logger.js";

export async function buildApp() {
  const app = Fastify({
    logger: buildLoggerConfig(),
    trustProxy: true,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "reqId",
  });

  app.setErrorHandler(errorHandler);

  await app.register(corsPlugin);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);
  await app.register(swaggerPlugin);

  await app.register(registerModules, { prefix: "/api/v1" });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        message: "Route not found",
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  });

  app.addHook("onReady", async () => {
    if (env.SWAGGER_ENABLED) {
      app.log.info(`Swagger docs available at http://localhost:${env.PORT}/docs`);
    }
  });

  return app;
}
