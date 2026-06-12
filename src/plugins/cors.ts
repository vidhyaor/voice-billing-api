import fp from "fastify-plugin";
import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import { env } from "../config/env.js";

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  const origin =
    env.CORS_ORIGIN === "*"
      ? true
      : env.CORS_ORIGIN.split(",").map((value) => value.trim());

  await fastify.register(cors, {
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
};

export default fp(corsPlugin, {
  name: "cors",
});
