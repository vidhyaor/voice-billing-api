import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env.js";

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  if (!env.SWAGGER_ENABLED) {
    return;
  }

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: env.APP_NAME,
        description:
          "SaaS Voice Billing API for Hardware, Electrical, Plumbing and Building Material Shops",
        version: env.APP_VERSION,
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}/api/v1`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
};

export default fp(swaggerPlugin, {
  name: "swagger",
});
