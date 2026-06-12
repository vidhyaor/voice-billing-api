import type { FastifyInstance } from "fastify";
import { ReportRepository } from "./report.repository.js";
import type { DateRangeQuery, SalesReportQuery } from "./report.schema.js";

export class ReportService {
  private readonly reportRepository: ReportRepository;

  constructor(fastify: FastifyInstance) {
    this.reportRepository = new ReportRepository(fastify.prisma);
  }

  async getSalesSummary(query: SalesReportQuery) {
    const { aggregate, byPaymentType, recentInvoices } =
      await this.reportRepository.getSalesSummary({
        startDate: query.startDate,
        endDate: query.endDate,
      });

    return {
      summary: {
        invoiceCount: aggregate._count.id,
        subtotal: aggregate._sum.subtotal?.toString() ?? "0",
        discount: aggregate._sum.discount?.toString() ?? "0",
        tax: aggregate._sum.tax?.toString() ?? "0",
        total: aggregate._sum.total?.toString() ?? "0",
      },
      byPaymentType: byPaymentType.map((row) => ({
        paymentType: row.paymentType,
        invoiceCount: row._count.id,
        total: row._sum.total?.toString() ?? "0",
      })),
      recentInvoices: recentInvoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        total: invoice.total.toString(),
        paymentType: invoice.paymentType,
        createdAt: invoice.createdAt,
      })),
    };
  }

  async getCustomerReport(query: DateRangeQuery) {
    const {
      customers,
      paymentsByCustomer,
      creditByCustomer,
      paymentsTotal,
      creditTotal,
    } = await this.reportRepository.getCustomerReport({
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const paymentMap = new Map(
      paymentsByCustomer.map((row) => [row.customerId, row._sum.amount]),
    );
    const creditMap = new Map(
      creditByCustomer.map((row) => [row.customerId, row._sum.total]),
    );

    const withOutstanding = customers.filter(
      (customer) => Number(customer.outstandingBalance) > 0,
    ).length;

    return {
      summary: {
        totalCustomers: customers.length,
        customersWithOutstanding: withOutstanding,
        totalOutstanding: customers
          .reduce((sum, customer) => sum + Number(customer.outstandingBalance), 0)
          .toFixed(2),
        paymentsCollected: paymentsTotal?.toString() ?? "0",
        creditSales: creditTotal?.toString() ?? "0",
      },
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        outstandingBalance: customer.outstandingBalance.toString(),
        paymentsInPeriod: paymentMap.get(customer.id)?.toString() ?? "0",
        creditSalesInPeriod: creditMap.get(customer.id)?.toString() ?? "0",
      })),
    };
  }

  async getProductReport(query: DateRangeQuery) {
    const { grouped, aggregate, productMap } =
      await this.reportRepository.getProductReport({
        startDate: query.startDate,
        endDate: query.endDate,
      });

    const products = grouped
      .map((row) => {
        const product = productMap.get(row.productId);

        if (!product) {
          return null;
        }

        return {
          productId: product.id,
          productCode: product.productCode,
          name: product.name,
          unit: product.unit,
          quantitySold: row._sum.quantity?.toString() ?? "0",
          revenue: row._sum.amount?.toString() ?? "0",
          lineItemCount: row._count.id,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));

    return {
      summary: {
        productsSold: products.length,
        totalQuantity: aggregate._sum.quantity?.toString() ?? "0",
        totalRevenue: aggregate._sum.amount?.toString() ?? "0",
        lineItemCount: aggregate._count.id,
      },
      products,
    };
  }

  async getOutstandingBalances() {
    const customers = await this.reportRepository.getOutstandingBalances();

    return {
      totalOutstanding: customers
        .reduce((sum, customer) => sum + Number(customer.outstandingBalance), 0)
        .toFixed(2),
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        outstandingBalance: customer.outstandingBalance.toString(),
      })),
    };
  }
}
