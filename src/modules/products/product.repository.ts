import type { Prisma, PrismaClient, Product } from "@prisma/client";
import type {
  CreateProductInput,
  ProductSortField,
  SortOrder,
  UpdateProductInput,
} from "./validation/product.validation.js";

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  aliases: {
    select: {
      alias: true,
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export interface ProductListFilters {
  q?: string;
  name?: string;
  categoryId?: string;
  productCode?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductListOptions {
  filters: ProductListFilters;
  skip: number;
  take: number;
  sortBy: ProductSortField;
  sortOrder: SortOrder;
}

export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  findByProductCode(productCode: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { productCode },
    });
  }

  async create(data: CreateProductInput): Promise<ProductWithRelations> {
    const { aliases, ...productData } = data;

    return this.prisma.product.create({
      data: {
        ...productData,
        description: productData.description ?? null,
        aliases: aliases.length
          ? { create: aliases.map((alias) => ({ alias })) }
          : undefined,
      },
      include: productInclude,
    });
  }

  async update(
    id: string,
    data: UpdateProductInput,
  ): Promise<ProductWithRelations> {
    const { aliases, ...productData } = data;

    if (aliases) {
      await this.prisma.productAlias.deleteMany({ where: { productId: id } });

      if (aliases.length > 0) {
        await this.prisma.productAlias.createMany({
          data: aliases.map((alias) => ({ alias, productId: id })),
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(productData.productCode !== undefined && {
          productCode: productData.productCode,
        }),
        ...(productData.name !== undefined && { name: productData.name }),
        ...(productData.description !== undefined && {
          description: productData.description,
        }),
        ...(productData.price !== undefined && { price: productData.price }),
        ...(productData.unit !== undefined && { unit: productData.unit }),
        ...(productData.stockQuantity !== undefined && {
          stockQuantity: productData.stockQuantity,
        }),
        ...(productData.categoryId !== undefined && {
          categoryId: productData.categoryId,
        }),
      },
      include: productInclude,
    });
  }

  delete(id: string): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }

  async findMany(
    options: ProductListOptions,
  ): Promise<[ProductWithRelations[], number]> {
    const where = await this.buildWhere(options.filters);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    return Promise.all([
      this.prisma.product.findMany({
        where,
        skip: options.skip,
        take: options.take,
        include: productInclude,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  countInvoiceItems(productId: string): Promise<number> {
    return this.prisma.invoiceItem.count({ where: { productId } });
  }

  categoryExists(categoryId: string): Promise<boolean> {
    return this.prisma.category
      .findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      .then((category) => category !== null);
  }

  private async buildWhere(
    filters: ProductListFilters,
  ): Promise<Prisma.ProductWhereInput> {
    const conditions: Prisma.ProductWhereInput[] = [];

    if (filters.q) {
      const aliasMatches = await this.prisma.productAlias.findMany({
        where: { alias: { contains: filters.q } },
        select: { productId: true },
      });

      conditions.push({
        OR: [
          { name: { contains: filters.q } },
          { productCode: { contains: filters.q } },
          { description: { contains: filters.q } },
          ...(aliasMatches.length > 0
            ? [{ id: { in: aliasMatches.map((row) => row.productId) } }]
            : []),
        ],
      });
    }

    if (filters.name) {
      conditions.push({ name: { contains: filters.name } });
    }

    if (filters.categoryId) {
      conditions.push({ categoryId: filters.categoryId });
    }

    if (filters.productCode) {
      conditions.push({ productCode: { contains: filters.productCode } });
    }

    if (filters.unit) {
      conditions.push({ unit: filters.unit });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      conditions.push({
        price: {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      });
    }

    if (filters.inStock === true) {
      conditions.push({ stockQuantity: { gt: 0 } });
    }

    if (filters.inStock === false) {
      conditions.push({ stockQuantity: { lte: 0 } });
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  private buildOrderBy(
    sortBy: ProductSortField,
    sortOrder: SortOrder,
  ): Prisma.ProductOrderByWithRelationInput {
    return { [sortBy]: sortOrder };
  }
}
