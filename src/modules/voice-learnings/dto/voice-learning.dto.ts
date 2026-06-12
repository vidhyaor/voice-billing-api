import type { PaginationMeta } from "../../../utils/pagination.js";

export interface VoiceLearningProductDto {
  id: string;
  productCode: string;
  name: string;
}

export interface VoiceLearningDto {
  id: string;
  phrase: string;
  usageCount: number;
  lastUsedAt: Date | null;
  productId: string;
  product: VoiceLearningProductDto;
}

export interface PaginatedVoiceLearningsDto {
  items: VoiceLearningDto[];
  meta: PaginationMeta;
}
