import { InvoiceStatus, PaymentType } from "@prisma/client";
import { z } from "zod";
import { idParamSchema, paginationSchema } from "../../../schemas/pagination.schema.js";

export const INVOICE_SORT_FIELDS = ["createdAt", "total", "invoiceNumber"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().positive("Unit price must be greater than 0").optional(),
  price: z.coerce.number().positive("Unit price must be greater than 0").optional(),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1).max(50).optional(),
  customerId: z.string().min(1, "Customer ID is required"),
  discount: z.coerce.number().min(0, "Discount cannot be negative").optional(),
  tax: z.coerce.number().min(0, "Tax cannot be negative").optional(),
  paymentType: z.nativeEnum(PaymentType, {
    errorMap: () => ({
      message: "Payment type must be CASH, CARD, UPI, or CREDIT",
    }),
  }),
  items: z.array(invoiceItemSchema).min(1, "At least one invoice item is required"),
});

export const invoiceIdParamSchema = idParamSchema;

export const invoiceListQuerySchema = paginationSchema.extend({
  customerId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentType: z.nativeEnum(PaymentType).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(INVOICE_SORT_FIELDS).optional().default("createdAt"),
  sortOrder: z.enum(SORT_ORDERS).optional().default("desc"),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceIdParam = z.infer<typeof invoiceIdParamSchema>;
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
export type InvoiceSortField = (typeof INVOICE_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
