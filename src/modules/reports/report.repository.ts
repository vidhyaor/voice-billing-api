import type { PaymentType, Prisma, PrismaClient } from "@prisma/client";

export interface DateRangeFilters {
  startDate?: Date;
  endDate?: Date;
}

export class ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSalesSummary(filters: DateRangeFilters) {
    const where = this.buildInvoiceDateWhere(filters);

    const [aggregate, byPaymentType, recentInvoices] = await Promise.all([
      this.prisma.invoice.aggregate({
        where,
        _sum: { subtotal: true, discount: true, tax: true, total: true },
        _count: { id: true },
      }),
      this.prisma.invoice.groupBy({
        by: ["paymentType"],
        where,
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.invoice.findMany({
        where,
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          paymentType: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      }),
    ]);

    return { aggregate, byPaymentType, recentInvoices };
  }

  async getCustomerReport(filters: DateRangeFilters) {
    const paymentWhere = this.buildPaymentDateWhere(filters);
    const invoiceWhere = this.buildInvoiceDateWhere(filters);

    const [
      customers,
      paymentsByCustomer,
      creditByCustomer,
      paymentsTotal,
      creditTotal,
    ] = await Promise.all([
      this.prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          outstandingBalance: true,
        },
        orderBy: { outstandingBalance: "desc" },
      }),
      this.prisma.payment.groupBy({
        by: ["customerId"],
        where: paymentWhere,
        _sum: { amount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ["customerId"],
        where: { ...invoiceWhere, paymentType: "CREDIT" },
        _sum: { total: true },
      }),
      this.prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...invoiceWhere, paymentType: "CREDIT" },
        _sum: { total: true },
      }),
    ]);

    return {
      customers,
      paymentsByCustomer,
      creditByCustomer,
      paymentsTotal: paymentsTotal._sum.amount,
      creditTotal: creditTotal._sum.total,
    };
  }

  async getProductReport(filters: DateRangeFilters) {
    const invoiceWhere = this.buildInvoiceDateWhere(filters);

    const itemWhere: Prisma.InvoiceItemWhereInput = {
      invoice: invoiceWhere,
    };

    const [grouped, aggregate] = await Promise.all([
      this.prisma.invoiceItem.groupBy({
        by: ["productId"],
        where: itemWhere,
        _sum: { quantity: true, amount: true },
        _count: { id: true },
      }),
      this.prisma.invoiceItem.aggregate({
        where: itemWhere,
        _sum: { quantity: true, amount: true },
        _count: { id: true },
      }),
    ]);

    const productIds = grouped.map((row) => row.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        productCode: true,
        name: true,
        unit: true,
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    return { grouped, aggregate, productMap };
  }

  async getOutstandingBalances() {
    return this.prisma.customer.findMany({
      where: { outstandingBalance: { gt: 0 } },
      select: {
        id: true,
        name: true,
        phone: true,
        outstandingBalance: true,
      },
      orderBy: { outstandingBalance: "desc" },
    });
  }

  private buildInvoiceDateWhere(
    filters: DateRangeFilters,
  ): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    return where;
  }

  private buildPaymentDateWhere(
    filters: DateRangeFilters,
  ): Prisma.PaymentWhereInput {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.startDate || filters.endDate) {
      where.paymentDate = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    return where;
  }
}

export type PaymentTypeSummary = {
  paymentType: PaymentType;
  _sum: { total: unknown };
  _count: { id: number };
};
