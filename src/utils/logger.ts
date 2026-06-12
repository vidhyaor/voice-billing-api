import type { FastifyServerOptions } from "fastify";
import { env } from "../config/env.js";

export function buildLoggerConfig(): FastifyServerOptions["logger"] {
  const isProduction = env.NODE_ENV === "production";

  return {
    level: env.LOG_LEVEL,
    ...(isProduction
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
        }),
  };
}
