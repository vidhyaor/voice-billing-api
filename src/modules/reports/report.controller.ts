import type { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../utils/response.js";
import type { ReportService } from "./report.service.js";
import type { DateRangeQuery, SalesReportQuery } from "./report.schema.js";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  salesSummary = async (
    request: FastifyRequest<{ Querystring: SalesReportQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const report = await this.reportService.getSalesSummary(request.query);
    reply.send(successResponse(report));
  };

  customerReport = async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const report = await this.reportService.getCustomerReport(request.query);
    reply.send(successResponse(report));
  };

  productReport = async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const report = await this.reportService.getProductReport(request.query);
    reply.send(successResponse(report));
  };

  outstandingBalances = async (
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const report = await this.reportService.getOutstandingBalances();
    reply.send(successResponse(report));
  };
}
