import { z } from "zod";

export const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const salesReportQuerySchema = dateRangeQuerySchema;

export type SalesReportQuery = z.infer<typeof salesReportQuerySchema>;
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
