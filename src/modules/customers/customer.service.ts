import type { Customer } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { handlePrismaError } from "../../utils/prisma-error.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type {
  CustomerDto,
  CustomerLedgerDto,
  PaginatedCustomersDto,
} from "./dto/customer.dto.js";
import { CustomerRepository } from "./customer.repository.js";
import type {
  CreateCustomerInput,
  CustomerListQuery,
} from "./validation/customer.validation.js";

export class CustomerService {
  private readonly customerRepository: CustomerRepository;

  constructor(fastify: FastifyInstance) {
    this.customerRepository = new CustomerRepository(fastify.prisma);
  }

  async create(input: CreateCustomerInput): Promise<CustomerDto> {
    const existing = await this.customerRepository.findByPhone(input.phone);

    if (existing) {
      throw new ConflictError("Phone number is already registered");
    }

    try {
      const customer = await this.customerRepository.create(input);
      return this.toCustomerDto(customer);
    } catch (error) {
      handlePrismaError(error, { P2002: "Phone number is already registered" });
    }
  }

  async getById(id: string): Promise<CustomerLedgerDto> {
    const ledger = await this.customerRepository.findLedgerData(id);

    if (!ledger.customer) {
      throw new NotFoundError("Customer not found");
    }

    const customer = this.toCustomerDto(ledger.customer);

    return {
      ...customer,
      summary: {
        totalCreditSales: ledger.creditSalesAggregate._sum.total?.toString() ?? "0",
        totalPaymentsCollected:
          ledger.paymentsAggregate._sum.amount?.toString() ?? "0",
        outstandingBalance: customer.outstandingBalance,
        creditInvoiceCount: ledger.creditSalesAggregate._count.id,
        paymentCount: ledger.paymentsAggregate._count.id,
      },
      creditSales: ledger.creditSales.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total.toString(),
        status: invoice.status,
        paymentType: invoice.paymentType,
        createdAt: invoice.createdAt,
      })),
      paymentHistory: ledger.paymentHistory.map((payment) => ({
        id: payment.id,
        amount: payment.amount.toString(),
        paymentDate: payment.paymentDate,
        notes: payment.notes,
      })),
    };
  }

  async list(query: CustomerListQuery): Promise<PaginatedCustomersDto> {
    const { page, limit, name, phone, hasOutstanding, sortBy, sortOrder } =
      query;
    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await this.customerRepository.findMany({
      filters: {
        name,
        phone,
        hasOutstanding:
          hasOutstanding === "true"
            ? true
            : hasOutstanding === "false"
              ? false
              : undefined,
      },
      skip,
      take,
      sortBy,
      sortOrder,
    });

    return {
      items: items.map((customer) => this.toCustomerDto(customer)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private toCustomerDto(customer: Customer): CustomerDto {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      outstandingBalance: customer.outstandingBalance.toString(),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
