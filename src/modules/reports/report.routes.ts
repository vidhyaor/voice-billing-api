import type { FastifyPluginAsync } from "fastify";
import { authenticate, validate } from "../../middleware/index.js";
import { ReportController } from "./report.controller.js";
import {
  dateRangeQuerySchema,
  salesReportQuerySchema,
} from "./report.schema.js";
import { ReportService } from "./report.service.js";

const reportRoutes: FastifyPluginAsync = async (fastify) => {
  const reportService = new ReportService(fastify);
  const reportController = new ReportController(reportService);

  fastify.addHook("preHandler", authenticate);

  fastify.get(
    "/sales",
    {
      preHandler: [validate(salesReportQuerySchema, "query")],
      schema: {
        tags: ["Reports"],
        summary: "Sales summary report",
        security: [{ bearerAuth: [] }],
      },
    },
    reportController.salesSummary,
  );

  fastify.get(
    "/customers",
    {
      preHandler: [validate(dateRangeQuerySchema, "query")],
      schema: {
        tags: ["Reports"],
        summary: "Customer activity and outstanding balances report",
        security: [{ bearerAuth: [] }],
      },
    },
    reportController.customerReport,
  );

  fastify.get(
    "/products",
    {
      preHandler: [validate(dateRangeQuerySchema, "query")],
      schema: {
        tags: ["Reports"],
        summary: "Product sales report",
        security: [{ bearerAuth: [] }],
      },
    },
    reportController.productReport,
  );

  fastify.get(
    "/outstanding-balances",
    {
      schema: {
        tags: ["Reports"],
        summary: "Outstanding customer balances",
        security: [{ bearerAuth: [] }],
      },
    },
    reportController.outstandingBalances,
  );
};

export default reportRoutes;
