import { InvoiceStatus, PaymentType, type Customer, type Prisma, type PrismaClient } from "@prisma/client";
import type { CreateCustomerInput, CustomerSortField, SortOrder } from "./validation/customer.validation.js";

export interface CustomerListFilters {
  name?: string;
  phone?: string;
  hasOutstanding?: boolean;
}

export interface CustomerListOptions {
  filters: CustomerListFilters;
  skip: number;
  take: number;
  sortBy: CustomerSortField;
  sortOrder: SortOrder;
}

export class CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  findByPhone(phone: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { phone } });
  }

  create(data: CreateCustomerInput): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address ?? null,
      },
    });
  }

  findMany(
    options: CustomerListOptions,
  ): Promise<[Customer[], number]> {
    const where = this.buildWhere(options.filters);
    const orderBy = {
      [options.sortBy]: options.sortOrder,
    } as Prisma.CustomerOrderByWithRelationInput;

    return Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy,
      }),
      this.prisma.customer.count({ where }),
    ]);
  }

  async findLedgerData(customerId: string) {
    const [customer, creditSales, paymentHistory, creditSalesAggregate, paymentsAggregate] =
      await Promise.all([
        this.prisma.customer.findUnique({ where: { id: customerId } }),
        this.prisma.invoice.findMany({
          where: {
            customerId,
            paymentType: PaymentType.CREDIT,
            status: { not: InvoiceStatus.CANCELLED },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            paymentType: true,
            createdAt: true,
          },
        }),
        this.prisma.payment.findMany({
          where: { customerId },
          orderBy: { paymentDate: "desc" },
          take: 20,
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            notes: true,
          },
        }),
        this.prisma.invoice.aggregate({
          where: {
            customerId,
            paymentType: PaymentType.CREDIT,
            status: { not: InvoiceStatus.CANCELLED },
          },
          _sum: { total: true },
          _count: { id: true },
        }),
        this.prisma.payment.aggregate({
          where: { customerId },
          _sum: { amount: true },
          _count: { id: true },
        }),
      ]);

    return {
      customer,
      creditSales,
      paymentHistory,
      creditSalesAggregate,
      paymentsAggregate,
    };
  }

  private buildWhere(filters: CustomerListFilters): Prisma.CustomerWhereInput {
    const where: Prisma.CustomerWhereInput = {};

    if (filters.name) {
      where.name = { contains: filters.name };
    }

    if (filters.phone) {
      where.phone = { contains: filters.phone };
    }

    if (filters.hasOutstanding === true) {
      where.outstandingBalance = { gt: 0 };
    }

    if (filters.hasOutstanding === false) {
      where.outstandingBalance = { lte: 0 };
    }

    return where;
  }
}
