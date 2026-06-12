import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type { PaginatedPaymentsDto, PaymentDto } from "./dto/payment.dto.js";
import {
  PaymentRepository,
  type PaymentWithCustomer,
} from "./payment.repository.js";
import type {
  CreatePaymentInput,
  PaymentListQuery,
} from "./validation/payment.validation.js";

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;
  private readonly prisma: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.prisma = fastify.prisma;
    this.paymentRepository = new PaymentRepository(fastify.prisma);
  }

  async create(input: CreatePaymentInput): Promise<PaymentDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const outstanding = Number(customer.outstandingBalance);

    if (outstanding <= 0) {
      throw new ValidationError("Customer has no outstanding balance to collect");
    }

    if (input.amount > outstanding) {
      throw new ValidationError(
        `Payment amount exceeds outstanding balance of ${outstanding.toFixed(2)}`,
      );
    }

    const payment = await this.paymentRepository.collectPayment({
      ...input,
      paymentDate: input.paymentDate ?? new Date(),
    });

    return this.toPaymentDto(payment, true);
  }

  async list(query: PaymentListQuery): Promise<PaginatedPaymentsDto> {
    const { page, limit, customerId } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await this.paymentRepository.findMany(
      { customerId },
      skip,
      take,
    );

    return {
      items: items.map((payment) => this.toPaymentDto(payment, false)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private toPaymentDto(
    payment: PaymentWithCustomer,
    includeBalanceAfter: boolean,
  ): PaymentDto {
    return {
      id: payment.id,
      customerId: payment.customerId,
      customer: {
        id: payment.customer.id,
        name: payment.customer.name,
        phone: payment.customer.phone,
      },
      amount: payment.amount.toString(),
      paymentDate: payment.paymentDate,
      notes: payment.notes,
      ...(includeBalanceAfter && {
        outstandingBalanceAfter: payment.customer.outstandingBalance.toString(),
      }),
    };
  }
}
