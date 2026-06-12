import { z } from "zod";
import { idParamSchema, paginationSchema } from "../../schemas/pagination.schema.js";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryListQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
});

export const categoryIdParamSchema = idParamSchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
