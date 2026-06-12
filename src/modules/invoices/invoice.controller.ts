import type { FastifyReply, FastifyRequest } from "fastify";
import { paginatedResponse, successResponse } from "../../utils/response.js";
import type { InvoiceService } from "./invoice.service.js";
import type {
  CreateInvoiceInput,
  InvoiceIdParam,
  InvoiceListQuery,
} from "./validation/invoice.validation.js";

export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateInvoiceInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const invoice = await this.invoiceService.create(request.body);
    reply.status(201).send(successResponse(invoice));
  };

  getById = async (
    request: FastifyRequest<{ Params: InvoiceIdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const invoice = await this.invoiceService.getById(request.params.id);
    reply.send(successResponse(invoice));
  };

  list = async (
    request: FastifyRequest<{ Querystring: InvoiceListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.invoiceService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };
}
