import type { FastifyReply, FastifyRequest } from "fastify";
import { paginatedResponse, successResponse } from "../../utils/response.js";
import type { PaymentService } from "./payment.service.js";
import type {
  CreatePaymentInput,
  PaymentListQuery,
} from "./validation/payment.validation.js";

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  create = async (
    request: FastifyRequest<{ Body: CreatePaymentInput }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const payment = await this.paymentService.create(request.body);
    reply.status(201).send(successResponse(payment));
  };

  list = async (
    request: FastifyRequest<{ Querystring: PaymentListQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.paymentService.list(request.query);
    reply.send(paginatedResponse(result.items, result.meta));
  };
}
