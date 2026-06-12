import { z } from "zod";

export const voiceProcessSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(2000, "Text must be at most 2000 characters"),
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

export type VoiceProcessInput = z.infer<typeof voiceProcessSchema>;
