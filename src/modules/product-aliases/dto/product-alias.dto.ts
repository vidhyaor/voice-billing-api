import type { PaginationMeta } from "../../../utils/pagination.js";

export interface ProductAliasProductDto {
  id: string;
  productCode: string;
  name: string;
}

export interface ProductAliasDto {
  id: string;
  alias: string;
  usageCount: number;
  productId: string;
  product: ProductAliasProductDto;
  createdAt: Date;
}

export interface PaginatedProductAliasesDto {
  items: ProductAliasDto[];
  meta: PaginationMeta;
}
