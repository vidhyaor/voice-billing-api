import {
  InvoiceStatus,
  type PaymentType,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";
import {
  buildInvoiceNumber,
  buildInvoiceNumberPrefix,
  getNextInvoiceSequence,
} from "./utils/invoice-number.generator.js";
import type { InvoiceSortField, SortOrder } from "./validation/invoice.validation.js";

const invoiceInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          productCode: true,
          unit: true,
        },
      },
    },
  },
} satisfies Prisma.InvoiceInclude;

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;

export interface InvoiceListFilters {
  customerId?: string;
  invoiceNumber?: string;
  paymentType?: PaymentType;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface InvoiceListOptions {
  filters: InvoiceListFilters;
  skip: number;
  take: number;
  sortBy: InvoiceSortField;
  sortOrder: SortOrder;
}

export interface CreateInvoiceData {
  invoiceNumber?: string;
  customerId: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentType: PaymentType;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  creditAmount: number;
  stockUpdates: Array<{ productId: string; quantity: number }>;
}

export class InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<InvoiceWithRelations | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
  }

  findByInvoiceNumber(invoiceNumber: string) {
    return this.prisma.invoice.findUnique({ where: { invoiceNumber } });
  }

  findMany(
    options: InvoiceListOptions,
  ): Promise<[InvoiceWithRelations[], number]> {
    const where = this.buildWhere(options.filters);
    const orderBy = {
      [options.sortBy]: options.sortOrder,
    } as Prisma.InvoiceOrderByWithRelationInput;

    return Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: invoiceInclude,
        orderBy,
      }),
      this.prisma.invoice.count({ where }),
    ]);
  }

  createWithItems(data: CreateInvoiceData): Promise<InvoiceWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const invoiceNumber =
        data.invoiceNumber ?? (await this.generateInvoiceNumber(tx));

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: data.customerId,
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          total: data.total,
          paymentType: data.paymentType,
          status: InvoiceStatus.COMPLETED,
          items: {
            create: data.items,
          },
        },
        include: invoiceInclude,
      });

      for (const stock of data.stockUpdates) {
        await tx.product.update({
          where: { id: stock.productId },
          data: {
            stockQuantity: { decrement: Math.ceil(stock.quantity) },
          },
        });
      }

      if (data.creditAmount > 0) {
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            outstandingBalance: { increment: data.creditAmount },
          },
        });
      }

      return invoice;
    });
  }

  private buildWhere(filters: InvoiceListFilters): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.invoiceNumber) {
      where.invoiceNumber = { contains: filters.invoiceNumber };
    }

    if (filters.paymentType) {
      where.paymentType = filters.paymentType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    return where;
  }

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const prefix = buildInvoiceNumberPrefix();
    const latest = await tx.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });

    const sequence = getNextInvoiceSequence(latest?.invoiceNumber, prefix);
    return buildInvoiceNumber(prefix, sequence);
  }
}
