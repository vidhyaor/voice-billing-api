import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { handlePrismaError } from "../../utils/prisma-error.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { CategoryRepository } from "./category.repository.js";
import type {
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

export class CategoryService {
  private readonly categoryRepository: CategoryRepository;

  constructor(fastify: FastifyInstance) {
    this.categoryRepository = new CategoryRepository(fastify.prisma);
  }

  async create(input: CreateCategoryInput) {
    const existing = await this.categoryRepository.findByName(input.name);

    if (existing) {
      throw new ConflictError("Category name is already in use");
    }

    try {
      return await this.categoryRepository.create(input);
    } catch (error) {
      handlePrismaError(error, { P2002: "Category name is already in use" });
    }
  }

  async getById(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }

  async list(query: CategoryListQuery) {
    const { page, limit, name } = query;
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await this.categoryRepository.findMany(
      { name },
      skip,
      take,
    );

    return {
      items,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, input: UpdateCategoryInput) {
    await this.getById(id);

    try {
      return await this.categoryRepository.update(id, input);
    } catch (error) {
      handlePrismaError(error, {
        P2002: "Category name is already in use",
        P2025: "Category not found",
      });
    }
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    const productCount = await this.categoryRepository.countProducts(id);

    if (productCount > 0) {
      throw new ConflictError(
        "Cannot delete category that has associated products",
      );
    }

    try {
      await this.categoryRepository.delete(id);
    } catch (error) {
      handlePrismaError(error, { P2025: "Category not found" });
    }
  }
}
