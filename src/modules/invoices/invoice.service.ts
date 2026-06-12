import { PaymentType, type PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors.js";
import { handlePrismaError } from "../../utils/prisma-error.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type {
  InvoiceDto,
  InvoiceListItemDto,
  PaginatedInvoicesDto,
} from "./dto/invoice.dto.js";
import { InvoiceRepository, type InvoiceWithRelations } from "./invoice.repository.js";
import {
  calculateInvoiceTotals,
  calculateLineAmount,
} from "./utils/invoice-calculator.js";
import type {
  CreateInvoiceInput,
  InvoiceListQuery,
} from "./validation/invoice.validation.js";

export class InvoiceService {
  private readonly invoiceRepository: InvoiceRepository;
  private readonly prisma: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.prisma = fastify.prisma;
    this.invoiceRepository = new InvoiceRepository(fastify.prisma);
  }

  async create(input: CreateInvoiceInput): Promise<InvoiceDto> {
    if (input.invoiceNumber) {
      const existing = await this.invoiceRepository.findByInvoiceNumber(
        input.invoiceNumber,
      );

      if (existing) {
        throw new ConflictError("Invoice number is already in use");
      }
    }

    try {
      const invoice = await this.invoiceRepository.createWithItems(
        await this.buildInvoiceData(input),
      );

      return this.toInvoiceDto(invoice);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Invoice number is already in use",
        P2003: "Customer or product not found",
      });
    }
  }

  async getById(id: string): Promise<InvoiceDto> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    return this.toInvoiceDto(invoice);
  }

  async list(query: InvoiceListQuery): Promise<PaginatedInvoicesDto> {
    const {
      page,
      limit,
      customerId,
      invoiceNumber,
      paymentType,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await this.invoiceRepository.findMany({
      filters: {
        customerId,
        invoiceNumber,
        paymentType,
        status,
        startDate,
        endDate,
      },
      skip,
      take,
      sortBy,
      sortOrder,
    });

    return {
      items: items.map((invoice) => this.toListItemDto(invoice)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private async buildInvoiceData(input: CreateInvoiceInput) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const lineItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }> = [];

    const stockUpdates: Array<{ productId: string; quantity: number }> = [];
    const seenProducts = new Set<string>();

    for (const item of input.items) {
      if (seenProducts.has(item.productId)) {
        throw new ValidationError(
          "Duplicate products in invoice items are not allowed",
        );
      }

      seenProducts.add(item.productId);

      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundError(`Product not found: ${item.productId}`);
      }

      const unitPrice =
        item.unitPrice ?? item.price ?? Number(product.price);
      const amount = calculateLineAmount(item.quantity, unitPrice);

      if (product.stockQuantity < Math.ceil(item.quantity)) {
        throw new ValidationError(
          `Insufficient stock for product: ${product.name}`,
        );
      }

      lineItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        amount,
      });

      stockUpdates.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const totals = calculateInvoiceTotals(
      lineItems,
      input.discount ?? 0,
      input.tax ?? 0,
    );

    if (totals.discount > totals.subtotal) {
      throw new ValidationError("Discount cannot exceed subtotal");
    }

    if (totals.total < 0) {
      throw new ValidationError("Invoice total cannot be negative");
    }

    const creditAmount =
      input.paymentType === PaymentType.CREDIT ? totals.total : 0;

    return {
      invoiceNumber: input.invoiceNumber,
      customerId: input.customerId,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      paymentType: input.paymentType,
      items: lineItems,
      creditAmount,
      stockUpdates,
    };
  }

  private toListItemDto(invoice: InvoiceWithRelations): InvoiceListItemDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customer: invoice.customer,
      subtotal: invoice.subtotal.toString(),
      discount: invoice.discount.toString(),
      tax: invoice.tax.toString(),
      total: invoice.total.toString(),
      paymentType: invoice.paymentType,
      status: invoice.status,
      itemCount: invoice.items.length,
      createdAt: invoice.createdAt,
    };
  }

  private toInvoiceDto(invoice: InvoiceWithRelations): InvoiceDto {
    return {
      ...this.toListItemDto(invoice),
      items: invoice.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
      })),
    };
  }
}
