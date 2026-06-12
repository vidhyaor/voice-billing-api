import { z } from "zod";
import { idParamSchema, paginationSchema } from "../../../schemas/pagination.schema.js";

export const PRODUCT_SORT_FIELDS = [
  "name",
  "price",
  "stockQuantity",
  "productCode",
  "createdAt",
  "updatedAt",
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

export const createProductSchema = z.object({
  productCode: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  unit: z.string().min(1).max(50).optional().default("PIECE"),
  aliases: z.array(z.string().min(1).max(100)).optional().default([]),
  stockQuantity: z.coerce.number().int().min(0).optional().default(0),
  categoryId: z.string().min(1),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const productIdParamSchema = idParamSchema;

export const productListQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
  name: z.string().optional(),
  categoryId: z.string().optional(),
  productCode: z.string().optional(),
  unit: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(PRODUCT_SORT_FIELDS).optional().default("createdAt"),
  sortOrder: z.enum(SORT_ORDERS).optional().default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
