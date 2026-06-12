import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { CustomerController } from "./customer.controller.js";
import { CustomerService } from "./customer.service.js";
import {
  createCustomerSchema,
  customerIdParamSchema,
  customerListQuerySchema,
} from "./validation/customer.validation.js";

const customerRoutes: FastifyPluginAsync = async (fastify) => {
  const customerService = new CustomerService(fastify);
  const customerController = new CustomerController(customerService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/",
    {
      preHandler: [validate(createCustomerSchema)],
      schema: {
        tags: ["Customer Ledger"],
        summary: "Create a new customer",
        security: [{ bearerAuth: [] }],
      },
    },
    customerController.create,
  );

  fastify.get(
    "/",
    {
      preHandler: [validate(customerListQuerySchema, "query")],
      schema: {
        tags: ["Customer Ledger"],
        summary: "List customers with outstanding balance filters",
        security: [{ bearerAuth: [] }],
      },
    },
    customerController.list,
  );

  fastify.get(
    "/:id",
    {
      preHandler: [validate(customerIdParamSchema, "params")],
      schema: {
        tags: ["Customer Ledger"],
        summary:
          "Get customer ledger with outstanding balance, credit sales, and payment history",
        security: [{ bearerAuth: [] }],
      },
    },
    customerController.getById,
  );
};

export default customerRoutes;
