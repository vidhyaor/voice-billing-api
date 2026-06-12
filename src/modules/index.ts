import type { FastifyPluginAsync } from "fastify";
import { authRoutes } from "./auth/index.js";
import { categoryRoutes } from "./categories/index.js";
import { customerRoutes } from "./customers/index.js";
import { healthRoutes } from "./health/index.js";
import { invoiceRoutes } from "./invoices/index.js";
import { paymentRoutes } from "./payments/index.js";
import { productAliasRoutes } from "./product-aliases/index.js";
import { productRoutes } from "./products/index.js";
import { reportRoutes } from "./reports/index.js";
import { usersRoutes } from "./users/index.js";
import { voiceLearningRoutes } from "./voice-learnings/index.js";
import { voiceRoutes } from "./voice/index.js";

const registerModules: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(usersRoutes, { prefix: "/users" });
  await fastify.register(categoryRoutes, { prefix: "/categories" });
  await fastify.register(productRoutes, { prefix: "/products" });
  await fastify.register(productAliasRoutes, { prefix: "/product-aliases" });
  await fastify.register(customerRoutes, { prefix: "/customers" });
  await fastify.register(invoiceRoutes, { prefix: "/invoices" });
  await fastify.register(paymentRoutes, { prefix: "/payments" });
  await fastify.register(voiceRoutes, { prefix: "/voice" });
  await fastify.register(voiceLearningRoutes, { prefix: "/voice-learnings" });
  await fastify.register(reportRoutes, { prefix: "/reports" });
};

export default registerModules;
