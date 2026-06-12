import { z } from "zod";
import { idParamSchema, paginationSchema } from "../../../schemas/pagination.schema.js";

export const CUSTOMER_SORT_FIELDS = [
  "name",
  "outstandingBalance",
  "createdAt",
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(20),
  address: z.string().max(500).optional().nullable(),
});

export const customerIdParamSchema = idParamSchema;

export const customerListQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
  phone: z.string().optional(),
  hasOutstanding: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(CUSTOMER_SORT_FIELDS).optional().default("createdAt"),
  sortOrder: z.enum(SORT_ORDERS).optional().default("desc"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CustomerIdParam = z.infer<typeof customerIdParamSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
