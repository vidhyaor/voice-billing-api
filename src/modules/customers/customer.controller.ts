import type { FastifyReply, FastifyRequest } from "fastify";
import { paginatedResponse, successResponse } from "../../utils/response.js";
import type { CustomerService } from "./customer.service.js";
import type {
  CreateCustomerInput,
  CustomerIdParam,
  CustomerListQuery,
} from "./validation/customer.validation.js";

export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateCustomerInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const customer = await this.customerService.create(request.body);
    reply.status(201).send(successResponse(customer));
  };

  list = async (
    request: FastifyRequest<{ Querystring: CustomerListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.customerService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };

  getById = async (
    request: FastifyRequest<{ Params: CustomerIdParam }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const ledger = await this.customerService.getById(request.params.id);
    reply.send(successResponse(ledger));
  };
}
