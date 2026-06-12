import type { Prisma, PrismaClient } from "@prisma/client";
import type { CreatePaymentInput } from "./validation/payment.validation.js";

const paymentInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
      outstandingBalance: true,
    },
  },
} satisfies Prisma.PaymentInclude;

export type PaymentWithCustomer = Prisma.PaymentGetPayload<{
  include: typeof paymentInclude;
}>;

export interface PaymentListFilters {
  customerId?: string;
}

export class PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findMany(
    filters: PaymentListFilters,
    skip: number,
    take: number,
  ): Promise<[PaymentWithCustomer[], number]> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    return Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        include: paymentInclude,
        orderBy: { paymentDate: "desc" },
      }),
      this.prisma.payment.count({ where }),
    ]);
  }

  collectPayment(
    data: CreatePaymentInput & { paymentDate: Date },
  ): Promise<PaymentWithCustomer> {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const payment = await tx.payment.create({
        data: {
          customerId: data.customerId,
          amount: data.amount,
          paymentDate: data.paymentDate,
          notes: data.notes ?? null,
        },
        include: paymentInclude,
      });

      const updatedCustomer = await tx.customer.update({
        where: { id: data.customerId },
        data: {
          outstandingBalance: { decrement: data.amount },
        },
      });

      return {
        ...payment,
        customer: {
          id: updatedCustomer.id,
          name: updatedCustomer.name,
          phone: updatedCustomer.phone,
          outstandingBalance: updatedCustomer.outstandingBalance,
        },
      };
    });
  }
}
