import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { handlePrismaError } from "../../utils/prisma-error.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type { PaginatedProductsDto, ProductDto } from "./dto/product.dto.js";
import {
  ProductRepository,
  type ProductWithRelations,
} from "./product.repository.js";
import type {
  CreateProductInput,
  ProductListQuery,
  UpdateProductInput,
} from "./validation/product.validation.js";

export class ProductService {
  private readonly productRepository: ProductRepository;

  constructor(fastify: FastifyInstance) {
    this.productRepository = new ProductRepository(fastify.prisma);
  }

  async create(input: CreateProductInput): Promise<ProductDto> {
    await this.ensureCategoryExists(input.categoryId);

    const existing = await this.productRepository.findByProductCode(
      input.productCode,
    );

    if (existing) {
      throw new ConflictError("Product code is already in use");
    }

    try {
      const product = await this.productRepository.create(input);
      return this.toProductDto(product);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Product code or alias is already in use",
        P2003: "Category not found",
      });
    }
  }

  async getById(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return this.toProductDto(product);
  }

  async list(query: ProductListQuery): Promise<PaginatedProductsDto> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      q,
      name,
      categoryId,
      productCode,
      unit,
      minPrice,
      maxPrice,
      inStock,
    } = query;

    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await this.productRepository.findMany({
      filters: {
        q,
        name,
        categoryId,
        productCode,
        unit,
        minPrice,
        maxPrice,
        inStock:
          inStock === "true" ? true : inStock === "false" ? false : undefined,
      },
      skip,
      take,
      sortBy,
      sortOrder,
    });

    return {
      items: items.map((product) => this.toProductDto(product)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductDto> {
    const existing = await this.productRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    if (input.categoryId) {
      await this.ensureCategoryExists(input.categoryId);
    }

    if (input.productCode && input.productCode !== existing.productCode) {
      const duplicate = await this.productRepository.findByProductCode(
        input.productCode,
      );

      if (duplicate) {
        throw new ConflictError("Product code is already in use");
      }
    }

    try {
      const product = await this.productRepository.update(id, input);
      return this.toProductDto(product);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Product code or alias is already in use",
        P2003: "Category not found",
        P2025: "Product not found",
      });
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.productRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const invoiceItemCount =
      await this.productRepository.countInvoiceItems(id);

    if (invoiceItemCount > 0) {
      throw new ConflictError(
        "Cannot delete product that is referenced by invoices",
      );
    }

    try {
      await this.productRepository.delete(id);
    } catch (error) {
      handlePrismaError(error, { P2025: "Product not found" });
    }
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const exists = await this.productRepository.categoryExists(categoryId);

    if (!exists) {
      throw new NotFoundError("Category not found");
    }
  }

  private toProductDto(product: ProductWithRelations): ProductDto {
    return {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      unit: product.unit,
      aliases: product.aliases.map((entry) => entry.alias),
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
