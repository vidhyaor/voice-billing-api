import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { PaymentController } from "./payment.controller.js";
import { PaymentService } from "./payment.service.js";
import {
  createPaymentSchema,
  paymentListQuerySchema,
} from "./validation/payment.validation.js";

const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  const paymentService = new PaymentService(fastify);
  const paymentController = new PaymentController(paymentService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/",
    {
      preHandler: [validate(createPaymentSchema)],
      schema: {
        tags: ["Customer Ledger"],
        summary: "Collect payment from customer and reduce outstanding balance",
        security: [{ bearerAuth: [] }],
      },
    },
    paymentController.create,
  );

  fastify.get(
    "/",
    {
      preHandler: [validate(paymentListQuerySchema, "query")],
      schema: {
        tags: ["Customer Ledger"],
        summary: "List payment collection history",
        security: [{ bearerAuth: [] }],
      },
    },
    paymentController.list,
  );
};

export default paymentRoutes;
