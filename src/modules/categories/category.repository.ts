import type { Category, Prisma, PrismaClient } from "@prisma/client";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

export class CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { name } });
  }

  create(data: CreateCategoryInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  findMany(
    filters: { name?: string },
    skip: number,
    take: number,
  ): Promise<[Category[], number]> {
    const where: Prisma.CategoryWhereInput = {};

    if (filters.name) {
      where.name = { contains: filters.name };
    }

    return Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      this.prisma.category.count({ where }),
    ]);
  }

  countProducts(categoryId: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId } });
  }
}
