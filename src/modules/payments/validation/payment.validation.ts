import { z } from "zod";
import { paginationSchema } from "../../../schemas/pagination.schema.js";

export const createPaymentSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const paymentListQuerySchema = paginationSchema.extend({
  customerId: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
