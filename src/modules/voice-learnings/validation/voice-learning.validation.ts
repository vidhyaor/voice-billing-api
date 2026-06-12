import { z } from "zod";
import {
  idParamSchema,
  paginationSchema,
} from "../../../schemas/pagination.schema.js";

export const LEARNING_SORT_FIELDS = [
  "phrase",
  "usageCount",
  "lastUsedAt",
] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const updateVoiceLearningSchema = z
  .object({
    phrase: z
      .string()
      .min(1, "Phrase is required")
      .max(200, "Phrase must be at most 200 characters")
      .transform((value) => value.trim())
      .optional(),
    productId: z.string().min(1).optional(),
  })
  .refine((data) => data.phrase !== undefined || data.productId !== undefined, {
    message: "At least one field must be provided for update",
  });

export const voiceLearningIdParamSchema = idParamSchema;

export const voiceLearningListQuerySchema = paginationSchema.extend({
  productId: z.string().optional(),
  q: z.string().optional(),
  sortBy: z.enum(LEARNING_SORT_FIELDS).optional().default("lastUsedAt"),
  sortOrder: z.enum(SORT_ORDERS).optional().default("desc"),
});

export type UpdateVoiceLearningInput = z.infer<
  typeof updateVoiceLearningSchema
>;
export type VoiceLearningIdParam = z.infer<typeof voiceLearningIdParamSchema>;
export type VoiceLearningListQuery = z.infer<
  typeof voiceLearningListQuerySchema
>;
export type LearningSortField = (typeof LEARNING_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
