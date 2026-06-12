import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { InvoiceController } from "./invoice.controller.js";
import { InvoiceService } from "./invoice.service.js";
import {
  createInvoiceSchema,
  invoiceIdParamSchema,
  invoiceListQuerySchema,
} from "./validation/invoice.validation.js";

const invoiceRoutes: FastifyPluginAsync = async (fastify) => {
  const invoiceService = new InvoiceService(fastify);
  const invoiceController = new InvoiceController(invoiceService);

  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/",
    {
      preHandler: [validate(createInvoiceSchema)],
      schema: {
        tags: ["Invoices"],
        summary:
          "Create invoice with items, totals, discount, tax, and payment type",
        security: [{ bearerAuth: [] }],
      },
    },
    invoiceController.create,
  );

  fastify.get(
    "/",
    {
      preHandler: [validate(invoiceListQuerySchema, "query")],
      schema: {
        tags: ["Invoices"],
        summary: "List invoices with filters and pagination",
        security: [{ bearerAuth: [] }],
      },
    },
    invoiceController.list,
  );

  fastify.get(
    "/:id",
    {
      preHandler: [validate(invoiceIdParamSchema, "params")],
      schema: {
        tags: ["Invoices"],
        summary: "Get invoice details with line items",
        security: [{ bearerAuth: [] }],
      },
    },
    invoiceController.getById,
  );
};

export default invoiceRoutes;
