import { z } from "zod";
import { idParamSchema, paginationSchema } from "../../../schemas/pagination.schema.js";

export const ALIAS_SORT_FIELDS = ["alias", "usageCount", "createdAt"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const createProductAliasSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  alias: z
    .string()
    .min(1, "Alias is required")
    .max(200, "Alias must be at most 200 characters")
    .transform((value) => value.trim()),
});

export const updateProductAliasSchema = z
  .object({
    alias: z
      .string()
      .min(1)
      .max(200)
      .transform((value) => value.trim())
      .optional(),
    productId: z.string().min(1).optional(),
  })
  .refine((data) => data.alias !== undefined || data.productId !== undefined, {
    message: "At least one field must be provided for update",
  });

export const productAliasIdParamSchema = idParamSchema;

export const productAliasListQuerySchema = paginationSchema.extend({
  productId: z.string().optional(),
  q: z.string().optional(),
  sortBy: z.enum(ALIAS_SORT_FIELDS).optional().default("createdAt"),
  sortOrder: z.enum(SORT_ORDERS).optional().default("desc"),
});

export type CreateProductAliasInput = z.infer<typeof createProductAliasSchema>;
export type UpdateProductAliasInput = z.infer<typeof updateProductAliasSchema>;
export type ProductAliasIdParam = z.infer<typeof productAliasIdParamSchema>;
export type ProductAliasListQuery = z.infer<typeof productAliasListQuerySchema>;
export type AliasSortField = (typeof ALIAS_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
