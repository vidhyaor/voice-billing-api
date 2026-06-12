import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "./validation/auth.validation.js";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify);
  const authController = new AuthController(authService);

  fastify.decorate("authService", authService);

  fastify.post(
    "/register",
    {
      preHandler: [validate(registerSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Register a new user account",
      },
    },
    authController.register,
  );

  fastify.post(
    "/login",
    {
      preHandler: [validate(loginSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Login and receive access + refresh tokens",
      },
    },
    authController.login,
  );

  fastify.post(
    "/refresh",
    {
      preHandler: [validate(refreshTokenSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Refresh access token using a valid refresh token",
      },
    },
    authController.refresh,
  );

  fastify.post(
    "/logout",
    {
      preHandler: [validate(logoutSchema)],
      schema: {
        tags: ["Auth"],
        summary: "Logout and revoke refresh token",
      },
    },
    authController.logout,
  );

  fastify.get(
    "/me",
    {
      preHandler: [authenticate],
      schema: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
      },
    },
    authController.me,
  );
};

export default authRoutes;
