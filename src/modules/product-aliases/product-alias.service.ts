import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { handlePrismaError } from "../../utils/prisma-error.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type {
  PaginatedProductAliasesDto,
  ProductAliasDto,
} from "./dto/product-alias.dto.js";
import {
  ProductAliasRepository,
  type ProductAliasWithProduct,
} from "./product-alias.repository.js";
import type {
  CreateProductAliasInput,
  ProductAliasListQuery,
  UpdateProductAliasInput,
} from "./validation/product-alias.validation.js";

export class ProductAliasService {
  private readonly productAliasRepository: ProductAliasRepository;

  constructor(fastify: FastifyInstance) {
    this.productAliasRepository = new ProductAliasRepository(fastify.prisma);
  }

  async create(input: CreateProductAliasInput): Promise<ProductAliasDto> {
    const productExists = await this.productAliasRepository.productExists(
      input.productId,
    );

    if (!productExists) {
      throw new NotFoundError("Product not found");
    }

    const existing = await this.productAliasRepository.findByAlias(input.alias);

    if (existing) {
      throw new ConflictError("Alias is already in use");
    }

    try {
      const alias = await this.productAliasRepository.create(input);
      return this.toDto(alias);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Alias is already in use",
        P2003: "Product not found",
      });
    }
  }

  async list(query: ProductAliasListQuery): Promise<PaginatedProductAliasesDto> {
    const { page, limit, productId, q, sortBy, sortOrder } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const [items, total] = await this.productAliasRepository.findMany({
      filters: { productId, q },
      skip,
      take,
      sortBy,
      sortOrder,
    });

    return {
      items: items.map((alias) => this.toDto(alias)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async update(
    id: string,
    input: UpdateProductAliasInput,
  ): Promise<ProductAliasDto> {
    const existing = await this.productAliasRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Product alias not found");
    }

    if (input.productId) {
      const productExists = await this.productAliasRepository.productExists(
        input.productId,
      );

      if (!productExists) {
        throw new NotFoundError("Product not found");
      }
    }

    if (input.alias && input.alias !== existing.alias) {
      const duplicate = await this.productAliasRepository.findByAlias(
        input.alias,
      );

      if (duplicate) {
        throw new ConflictError("Alias is already in use");
      }
    }

    try {
      const alias = await this.productAliasRepository.update(id, input);
      return this.toDto(alias);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Alias is already in use",
        P2003: "Product not found",
        P2025: "Product alias not found",
      });
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.productAliasRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Product alias not found");
    }

    try {
      await this.productAliasRepository.delete(id);
    } catch (error) {
      handlePrismaError(error, { P2025: "Product alias not found" });
    }
  }

  private toDto(alias: ProductAliasWithProduct): ProductAliasDto {
    return {
      id: alias.id,
      alias: alias.alias,
      usageCount: alias.usageCount,
      productId: alias.productId,
      product: alias.product,
      createdAt: alias.createdAt,
    };
  }
}
