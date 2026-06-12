import type { PaginationMeta } from "../../../utils/pagination.js";

export interface ProductCategoryDto {
  id: string;
  name: string;
}

export interface ProductDto {
  id: string;
  productCode: string;
  name: string;
  description: string | null;
  price: string;
  unit: string;
  aliases: string[];
  stockQuantity: number;
  categoryId: string;
  category: ProductCategoryDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProductsDto {
  items: ProductDto[];
  meta: PaginationMeta;
}
